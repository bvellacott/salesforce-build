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
deploy.setLogLevel('error'); // none, info or error

const toolOptions = require('./toolOptions');

const sfCreds = require('../sfCredentials.json');

const testsStatic = pickFiles('./shared', {
  include: ['tests.html'],
  destDir: '.'
});

function build(pagesDir, pageName, node_modules, options) {
	options = options || {};
	const dependencies = options.dependencies || [];
	const cssDependencies = options.cssDependencies || [];
	const testDependencies = options.testDependencies || []; 
	const debugResult = options.debugResult;
	const isProduction = options.isProduction;

	const pagepath = pagesDir + '/' + pageName + '.resource';
	const jsPath = pagepath + '/js';
	const stylePath = pagepath + '/style';
	const staticFilesPath = pagepath + '/static';
	
	var allNodes = [ testsStatic, staticFilesPath];
 	var staticresourceNodes = [staticFilesPath];

	// page
	var page = pickFiles(pagepath, { include: ['page.html']});
	page = replace(page, {
	  files: [ 'page.html' ],
	  patterns: [
	    { json : require('../package.json') },
	    { json : { 
	    	resourceName: pageName,
	    }}
	  ]
	});

	page = deploy(page, {
 		skipFirstBuild: !isProduction,
 	  type: 'ApexPage',
 	  apiVersion: '37.0',
 	  file: 'page.html',
 	  name: pageName,
	  username: sfCreds.username,
	  password: sfCreds.password,
	  securityToken: sfCreds.securityToken
 	});
 	page = debug(page, "page");
 	allNodes.push(page);

	// tool
	var tool = pickFiles(jsPath, { include: ['**/*'], exclude: ['**/*.test.js'] });
	var browserEntry = writeFile('./__browserEntry.js', 'require("./app");');
	var jshintTests = jshint(tool, toolOptions.jshintOptions(pageName + ' - jshint'));
	jshintTests = concat(
		jshintTests, 
		{
		  outputFile: './jshint.tests.js',
		  inputFiles: ['**/*'],
		  sourceMapConfig: { enabled: false },
		}
	);
  allNodes.push(jshintTests);

	tool = mergeNodes([browserEntry, tool]);
	var transpiledTool = es6Transpile(tool);
	tool = mergeNodes([transpiledTool, node_modules]);

	tool = watchify(tool, toolOptions.watchifyOptions('./__browserEntry.js', 'app.js', isProduction));
	if(isProduction) {
		tool = uglify(tool, toolOptions.uglify(isProduction));
	}
	staticresourceNodes.push(tool);
  allNodes.push(tool);

	//style
	var style = sassCompile([stylePath], 'app.scss', 'app.css', toolOptions.sassCompileOptions(pageName, isProduction));
	staticresourceNodes.push(style);
  allNodes.push(style);

  // vendor js and css
	if(dependencies && dependencies.length) {
		var deps = mergeNodes(dependencies);
		deps = concat(deps, 
			{
			  outputFile: './vendor.js',
			  inputFiles: ['**/*.js'],
			  sourceMapConfig: { enabled: !isProduction },
			}
		);
		if(isProduction) {
			deps = uglify(deps, toolOptions.uglify(isProduction));
		}
	  staticresourceNodes.push(deps);
		allNodes.push(deps);
	}

	if(cssDependencies && cssDependencies.length) {
		var cssDeps = mergeNodes(cssDependencies);
		cssDeps = concat(
			cssDeps, 
			{
			  outputFile: './vendor.css',
			  inputFiles: ['**/*.css'],
			  sourceMapConfig: { enabled: false },
			}
		);
		if(isProduction) {
			cssDeps = cleanCSS(cssDeps);		
		}
	  staticresourceNodes.push(cssDeps);
		allNodes.push(cssDeps);
	}

	// package and deploy the static resource
	var staticresource = mergeNodes(staticresourceNodes);
 	staticresource = zip(staticresource, { name: 'resource.zip' });
 	staticresource = deploy(staticresource, {
 		skipFirstBuild: !isProduction,
 	  type: 'StaticResource',
 	  file: 'resource.zip',
 	  name: pageName,
	  username: sfCreds.username,
	  password: sfCreds.password,
	  securityToken: sfCreds.securityToken
 	});
 	staticresource = debug(staticresource, "resource");
  allNodes.push(staticresource);

 	// tests
 	var tests = pickFiles(jsPath, { include: ['**/*.test.js'] });
	tests = es6Transpile(tests);
	tests = mergeNodes([tests, transpiledTool]);
	tests = watchify(tests, toolOptions.watchifyOptions('./app.test.js', 'tests.js', isProduction));
  allNodes.push(tests);
	
	if(testDependencies && testDependencies.length) {
		var testDeps = mergeNodes(testDependencies);
		testDeps = concat(testDeps, 
			{
			  outputFile: './vendorTestDeps.js',
			  inputFiles: ['**/*.js'],
			  sourceMapConfig: { enabled: true },
			}
		);
		allNodes.push(testDeps);
	}

	var all = mergeNodes(allNodes);

	if(debugResult) {
		all = debug(all, { name: pageName });
	}

	return pickFiles(all, { destDir: pageName });
}

module.exports = build;