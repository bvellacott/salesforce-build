const copy = require('copy-template-dir');
const fs = require('fs');
const path = require('path');
 
const program = require('commander')
  .option('-p, --page [value]', 'Generate a new page with the given name')
  .option('-r, --staticresource [value]', 'Generate a new staticresource with the given name')
  .parse(process.argv);

const vars = { 
	pageName: 'bar',
}

if(program.page) {
	var inDir = path.join(process.cwd(), 'templates/page')
  var outDir = path.join(process.cwd(), 'dev/', program.page)
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! a page setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: program.page }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}

if(program.staticresource) {
	var inDir = path.join(process.cwd(), 'templates/staticresource')
  var outDir = path.join(process.cwd(), 'dev/', program.staticresource)
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! a staticresource setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: program.page }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}
