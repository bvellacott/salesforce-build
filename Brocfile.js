const pickFiles = require('broccoli-funnel');
const mergeNodes = require('broccoli-merge-trees');
const debug = require('broccoli-stew').debug;
const concat = require('broccoli-concat');
const fs = require('fs');
const path = require('path');

const BrowserSync = require('broccoli-browser-sync-bv');
const proxy = require('http-proxy-middleware');

const buildPage = require('./buildTools/pageBuilder');
const buildBundle = require('./buildTools/bundleBuilder');
const buildAllTests = require('./buildTools/ciTestsBuilder');

// const BrowserSync = require('broccoli-browser-sync');

const isProduction = process.env.BROCCOLI_ENV === 'production';
var allNodes = [];

const pagesDir = '.';
const bundlesDir = './aura';

var node_modules = pickFiles('./browserified_modules', { include: ['**/*'], destDir: './node_modules' });

const sharedTestDepsList = [
// add your shared browser test dependencies in this list
  pickFiles('./bower_components/jquery/dist', { include: ['jquery.js']}),
  pickFiles('./bower_components/moment', { include: ['moment.js']})
];

if(sharedTestDepsList && sharedTestDepsList.length) {
	var sharedTestDeps = concat(
		mergeNodes(sharedTestDepsList), 
		{
		  outputFile: './sharedVendorTestDeps.js',
		  inputFiles: ['**/*.js'],
		  sourceMapConfig: { enabled: true },
		}
	);
	allNodes.push(sharedTestDeps);
}

const pageBuildOptions = {
	'attempt1': {
		debugNode: false,
		dependencies: [ pickFiles('./bower_components/jquery-ui', { include: ['jquery-ui.js'], destDir: '.'}) ],
		cssDependencies: [ pickFiles('./bower_components/bootstrap/dist/css', { include: ['bootstrap', 'bootstrap-theme.css'], destDir: '.'}) ],
		// testDependencies: [ pickFiles('./bower_components/jquery-ui', { include: ['jquery-ui.js'], destDir: '.'}) ],
	}
}

function getPageBuildOptions(pageName) {
	return Object.assign(
		{ 
		// define your default page build options here
			isProduction: isProduction
		},
		pageBuildOptions[pageName]
	);
}

// pages
var pageNodes = [];
var pageDirectories = fs.readdirSync(pagesDir).filter(function(file) {
	return fs.statSync(path.join(pagesDir, file)).isDirectory() && 
		file.endsWith('.resource');
});

pageDirectories.forEach(function(pageDir) {
	var pageName = path.basename(pageDir).replace('.resource', '');
	var pageNode = buildPage(pagesDir, pageName, node_modules, getPageBuildOptions(pageName));
	pageNodes.push(pageNode);
});

var pages = mergeNodes(pageNodes);

// lightning bundles
var bundleNodes = [];
var bundleDirectories = fs.readdirSync(bundlesDir).filter(function(file) {
	return fs.statSync(path.join(bundlesDir, file)).isDirectory();
});

bundleDirectories.forEach(function(bundleDir) {
	var bundleName = path.basename(bundleDir);
	var bundleNode = buildBundle(bundlesDir, bundleName, node_modules, { debugResult: true, isProduction: isProduction });
	bundleNodes.push(bundleNode);
});

var bundles = mergeNodes(bundleNodes);

var pagesAndBundles = mergeNodes([pages, bundles]);

// browsersync options 
var bsOptions = {
  browserSync: {
    open: false,
    middleware: [
      proxy('/api/**', {
        target: 'http://localhost:8080/',
        pathRewrite: {
          '^/api': ''
        }
      }),
      proxy('/live', {
        target: 'http://localhost:8080/',
        pathRewrite: {
          '^/live': ''
        },
        ws: true})
    ]
  }
};
var browserSync = new BrowserSync([pagesAndBundles], bsOptions);

allNodes = allNodes.concat([pagesAndBundles, browserSync]);

const staticTestFiles = pickFiles(
	mergeNodes(['./node_modules/qunitjs/qunit', 'shared']), {
  include: ['qunit.js', 'qunit.css', 'allTests.html', 'testLogger.js'],
  destDir: '.'
});
allNodes.push(staticTestFiles);

if(isProduction) {
	allNodes.push(buildAllTests(pagesDir, pageBuildOptions, node_modules));
}
	
var all = mergeNodes(allNodes);

module.exports = all;
