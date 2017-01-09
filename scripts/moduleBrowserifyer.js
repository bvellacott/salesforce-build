const browserify = require('browserify')
const fs = require('fs-extra');

const package = require('../package.json');

const browserifyNodeModules = function(dependencyListName) {
	dependencyListName = dependencyListName || 'dependencies';
	const browserified_modules_path = './browserified_modules';
	const node_modules_js_path = browserified_modules_path + '/_modules.js';

	const browserifyOpts = {
	  browserify: { debug: true/*, entries: [node_modules_js_path]*/ },
	  outputFile: browserified_modules_path + '/modules.js',
	  cache: true,
	  standalone: 'standalone'
	};

	if(fs.existsSync(browserified_modules_path)) {
		fs.removeSync(browserified_modules_path);
	}
	fs.mkdirSync(browserified_modules_path);

	var node_modules_entry = 'module.exports = {';
	for(var dependency in package[dependencyListName]) {
		node_modules_entry += '\n  "' + dependency + '": require("' + dependency + '"),';

		var dependencyPath = browserified_modules_path + '/' + dependency;
		var packageJsonPath = './node_modules/' + dependency + '/package.json';
		var browserifiedPackageJsonPath = browserified_modules_path + '/' + dependency + '/package.json';
		fs.mkdirSync(dependencyPath);
		fs.copySync(packageJsonPath, browserifiedPackageJsonPath);
		var index = fs.writeFileSync(dependencyPath + '/index.js', 'module.exports = require("../modules")["' + dependency + '"];');
	}
	node_modules_entry += '\n};';
	fs.writeFileSync(node_modules_js_path, node_modules_entry);
	var b = browserify(browserifyOpts);
	b.add(node_modules_js_path);
	return b.bundle().pipe(fs.createWriteStream(browserified_modules_path + '/modules.js'));
}

module.exports = browserifyNodeModules;