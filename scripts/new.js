const copy = require('copy-template-dir');
const fs = require('fs');
const path = require('path');
 
const program = require('commander')
  .option('-p, --page [value]', 'Generate a new page with the given name')
  .option('-r, --staticresource [value]', 'Generate a new staticresource with the given name')
  .option('-c, --auracomponent [value]', 'Generate a new aura component with the given name')
  .option('-a, --auraapp [value]', 'Generate a new aura app with the given name')
  .parse(process.argv);

const vars = { 
	pageName: 'bar',
}

var name;
if(program.page) {
	name = program.page;
	var inDir = path.join(process.cwd(), 'templates/page')
  var outDir = path.join(process.cwd(), './', name + '.resource')
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! a page + staticresource setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: name }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}

if(program.staticresource) {
	name = program.staticresource;
	var inDir = path.join(process.cwd(), 'templates/staticresource')
  var outDir = path.join(process.cwd(), './', name + '.resource')
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! a staticresource setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: name }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}

if(program['auracomponent']) {
	name = program['auracomponent'];
	var inDir = path.join(process.cwd(), 'templates/auraComponent')
  var outDir = path.join(process.cwd(), 'aura', name)
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! an aura component setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: name }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}

if(program['auraapp']) {
	name = program['auraapp'];
	var inDir = path.join(process.cwd(), 'templates/auraApp')
  var outDir = path.join(process.cwd(), 'aura', name)
  if(fs.existsSync(outDir)) {
  	console.error("!ERROR! an aura app setup already exists at: " + outDir);
  	process.exit(0);
  }
	
	copy(inDir, outDir, { name: name }, (err, createdFiles) => {
	  if (err) throw err
	  createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
	});
}
