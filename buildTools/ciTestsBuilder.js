const pickFiles = require('broccoli-funnel');
const jshint = require('broccoli-jshint');
const writeFile = require('broccoli-file-creator');
const watchify = require('broccoli-watchify');
const es6Transpile = require('broccoli-babel-transpiler');
const mergeNodes = require('broccoli-merge-trees');
const concat = require('broccoli-concat');
const debug = require('broccoli-stew').debug;
const fs = require('fs');
const path = require('path');

const options = require('./toolOptions');

const buildCiTests = function(pagesDir, pageBuildOptions, node_modules) {
  var allNodes = [];

	var appCode = pickFiles(pagesDir, { include: [ '*/js/**/*.js' ], exclude: [ '*/js/**/*.test.js' ] });
	var jshintTests = jshint(appCode, options.jshintOptions("all tests"));
	jshintTests = concat(
		jshintTests, 
		{
		  outputFile: './allJshint.tests.js',
		  inputFiles: ['**/*'],
		  sourceMapConfig: { enabled: false },
		}
	);
	allNodes.push(jshintTests);

	var allPageDepsList = [];
	for(var pageName in pageBuildOptions) {
		var opts = pageBuildOptions[pageName];
		if(opts && opts.testDependencies && opts.testDependencies.length) {
			allPageDepsList = allPageDepsList.concat(opts.testDependencies);
		}
	}

	if(allPageDepsList && allPageDepsList.length) {
		var sharedTestDeps = concat(
			mergeNodes(allPageDepsList), 
			{
			  outputFile: './vendorTestDeps.js',
			  inputFiles: ['**/*.js'],
			  sourceMapConfig: { enabled: true },
			}
		);
		allNodes.push(sharedTestDeps);
	}

	var appAndTestCode = pickFiles(pagesDir, { include: [ '*/js/**/*.js' ] });
	appAndTestCode = es6Transpile(appAndTestCode);

	var pageDirectories = fs.readdirSync(pagesDir).filter(function(file) {
		return fs.statSync(path.join(pagesDir, file)).isDirectory();
	});

	var allTestsEntryStr = "";
	pageDirectories.forEach(function(pageDir) {
		var pageName = path.basename(pageDir);
		allTestsEntryStr += "require('./" + pageName + "/js/app.test.js');\n"
	});
	var allTestsEntry = writeFile('./__allTestsEntry.js', allTestsEntryStr);

	var testsCodeAndDependencies = mergeNodes([allTestsEntry, appAndTestCode, node_modules]);

	var watchifiedTests = watchify(testsCodeAndDependencies, options.watchifyOptions('./__allTestsEntry.js', 'allTests.js', true));
	allNodes.push(watchifiedTests);

	var allTestsAndDependencies = mergeNodes(allNodes);

	return allTestsAndDependencies;
}

module.exports = buildCiTests;