const path = require('path');
const uglify = require('broccoli-uglify-sourcemap');
const es6Transpile = require('broccoli-babel-transpiler');
const jshint = require('broccoli-jshint');
const sassCompile = require('broccoli-sass-source-maps');
const cleanCSS = require('broccoli-clean-css');
const pickFiles = require('broccoli-funnel');
const mergeNodes = require('broccoli-merge-trees');
const env = require('broccoli-env').getEnv();
const rename = require('broccoli-stew').rename;
const writeFile = require('broccoli-file-creator');
const watchify = require('broccoli-watchify');
const concat = require('broccoli-concat');
const log = require('broccoli-stew').log;
const debug = require('broccoli-stew').debug;
const replace = require('broccoli-replace');
const zip = require('broccoli-zip-js');
const deploy = require('broccoli-salesforce-deploy');
deploy.setLogLevel('info'); // none, info or error

const toolOptions = require('./toolOptions');

const sfCreds = require('../sfCredentials.json');

const testsStatic = pickFiles('./shared', {
  include: ['tests.html'],
  destDir: '.'
});

function build(bundlesDir, bundleName, node_modules, options) {
	options = options || {};
	const dependencies = options.dependencies || [];
	const cssDependencies = options.cssDependencies || [];
	const testDependencies = options.testDependencies || []; 
	const debugResult = options.debugResult;
	const isProduction = options.isProduction;

	const bundlePath = bundlesDir + '/' + bundleName
	const jsPath = bundlePath + '/js';
	const stylePath = bundlePath + '/style';

	const appName = bundleName + '.app';
	const auradocName = bundleName + '.auradoc';
	const componentName = bundleName + '.cmp';
	const styleName = bundleName + '.scss';
	const designName = bundleName + '.design';
	const svgName = bundleName + '.svg';
	const controllerName = bundleName + 'Controller.js'
	const helperName = bundleName + 'Helper.js';
	const rendererName = bundleName + 'Renderer.js';

	var allNodes = [testsStatic];

	// component
	// var component = pickFiles(bundlePath, { include: componentName, auradocName, designName });
	// component = replace(component, {
	//   files: [ componentName ],
	//   patterns: [
	//     { json : require('../package.json') },
	//     { json : { 
	//     	resourceName: bundleName,
	//     }}
	//   ]
	// });

	var deploymentDefaults = {
 		skipFirstBuild: !isProduction,
 	  type: 'AuraDefinition',
 	  apiVersion: '37.0',
 	  // file: 'page.html',
 	  // defType: 'APPLICATION', 'DESIGN', 'HELPER', 'CONTROLLER', 'RENDERER', 'DOCUMENTATION', 'STYLE', 'COMPONENT', 'SVG'
 	  name: bundleName,
	  username: sfCreds.username,
	  password: sfCreds.password,
	  securityToken: sfCreds.securityToken
 	};

	var app = deploy(pickFiles(bundlePath, { include: [ appName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: appName,
		defType: 'APPLICATION',
		format: 'XML' 
	}));

	var auradoc = deploy(pickFiles(bundlePath, { include: [ auradocName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: auradocName,
		defType: 'DOCUMENTATION',
		format: 'XML' 
	}));

	var component = deploy(pickFiles(bundlePath, { include: [ componentName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: componentName,
		defType: 'COMPONENT',
		format: 'XML' 
	}));

	var design = deploy(pickFiles(bundlePath, { include: [ designName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: designName,
		defType: 'DESIGN',
		format: 'XML' 
	}));

	var svg = deploy(pickFiles(bundlePath, { include: [ svgName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: svgName,
		defType: 'SVG',
		format: 'SVG' 
	}));
 	allNodes = allNodes.concat([ app, auradoc, component, design, svg ]);

	console.log('!!! bundlePath: ' + bundlePath + ' !!!');
	console.log('!!! bundlesDir: ' + bundlesDir + ' !!!');
	console.log('!!! bundleName: ' + bundleName + ' !!!');
	console.log('!!! controllerName: ' + controllerName + ' !!!');
	console.log('!!! helperName: ' + helperName + ' !!!');
	console.log('!!! __dirname: ' + __dirname + ' !!!');
 	var testableController = concat(bundlePath, {
	  outputFile: controllerName + '.hintable',
	  header: "module.exports = ",
	  inputFiles: [controllerName],
	  footer: ';',
	  sourceMapConfig: { enabled: false },
	  allowNone: true
	});
	var testableHelper = concat(bundlePath, {
	  outputFile: helperName + '.hintable',
	  header: "module.exports = ",
	  inputFiles: [helperName],
	  footer: ';',
	  sourceMapConfig: { enabled: false },
	  allowNone: true
	});
 	var testableRenderer = concat(bundlePath, {
	  outputFile: rendererName + '.hintable',
	  header: "module.exports = ",
	  inputFiles: [rendererName],
	  footer: ';',
	  sourceMapConfig: { enabled: false },
	  allowNone: true
	});
	var hintables = mergeNodes([
		pickFiles('.', { include: [ '.jshintrc' ] }),
		jsPath,
	 	testableController,
	 	testableHelper,
		testableRenderer
	]);

	// tool
	var tool = pickFiles(bundlePath, { include: ['**/*.js'], exclude: ['**/*.test.js'] });
	var jshintTests = jshint(hintables, toolOptions.jshintOptions(bundleName + ' - jshint'));
	jshintTests = concat(
		jshintTests, 
		{
		  outputFile: './jshint.tests.js',
		  inputFiles: ['**/*'],
		  sourceMapConfig: { enabled: false },
		}
	);
  allNodes.push(jshintTests);

	var tool = es6Transpile(tool, { blacklist: ["useStrict"] });
	var helper = mergeNodes([tool, node_modules]);

	// helper = watchify(helper, toolOptions.watchifyOptions(helperName, helperName, isProduction));
	// tool = mergeNodes([tool, helper], { overwrite: true });
	if(isProduction) {
		tool = uglify(tool, toolOptions.uglify(isProduction));
	}
  
	var controller = deploy(pickFiles(tool, { include: [ controllerName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: controllerName,
		defType: 'CONTROLLER',
		format: 'JS' 
	}));
	var helper = deploy(pickFiles(tool, { include: [ helperName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: helperName,
		defType: 'HELPER',
		format: 'JS' 
	}));
	var renderer = deploy(pickFiles(tool, { include: [ rendererName ] }), 
		Object.assign({}, deploymentDefaults, { 
		file: rendererName,
		defType: 'RENDERER',
		format: 'JS' 
	}));
 	allNodes = allNodes.concat([ controller, helper, renderer ]);

	//style
	var style = sassCompile([pickFiles(bundlePath, { include: ['**/*.sass', '**/*.scss'] })], styleName, bundleName + '.css', toolOptions.sassCompileOptions(bundleName, isProduction));
	style = deploy(style, 
		Object.assign({}, deploymentDefaults, { 
		file: bundleName + '.css',
		defType: 'STYLE',
		format: 'css' 
	}));
  allNodes.push(style);

 	// tests
 	var tests = pickFiles(bundlePath, { include: ['**/*.test.js'] });
	tests = es6Transpile(tests);
	tests = mergeNodes([tests, testableController, testableHelper, testableRenderer]);
	tests = watchify(tests, toolOptions.watchifyOptions('./' + bundleName + '.test.js', 'tests.js', isProduction));
  allNodes.push(tests);
	
	if(testDependencies && testDependencies.length) {
		var testDeps = mergeNodes(testDependencies);
		testDeps = concat(testDeps, {
			  outputFile: './vendorTestDeps.js',
			  inputFiles: ['**/*.js'],
			  sourceMapConfig: { enabled: true },
			}
		);
		allNodes.push(testDeps);
	}

	var all = mergeNodes(allNodes);

	if(debugResult) {
		all = debug(all, { name: bundleName });
	}

	return pickFiles(all, { destDir: bundleName });
}

module.exports = build;