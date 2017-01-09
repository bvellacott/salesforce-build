module.exports = {
	jshintOptions(name) {
		return {
			jshintrcPath: './.jshintrc',
			log: true,
			disableTestGenerator: false,
			// testGenerator() { throw new Error('not implemented'); },
			console: console,
			annotation: name
		};
	},

	// see: https://github.com/substack/node-browserify#user-content-methods
	watchifyOptions(entryFile, outputFile, isProduction) {
		return {
		  browserify: { entries: [entryFile], debug: !isProduction },
		  outputFile: outputFile,
		  cache: true
		};
	},

	// see: https://www.npmjs.com/package/node-sass
	sassCompileOptions(name, isProduction) {
		return { 
			annotation: 'scss-' + name, 
			sourceMap: !isProduction,
			sourceMapEmbed: !isProduction,
			sourceMapContents: !isProduction,
			outputStyle: (isProduction ? 'compressed' : 'nested') // outputStyle choices: nested, expanded, compact, compressed
		};
	},

	uglify(isProduction) {
		return {
			mangle: true, 
			compress: true, 
			sourceMapConfig: {
				enabled: !isProduction 
			} 
		};
	}
};
