const program = require('commander')
  .option('-t, --target [value]', 'Run ci build')
  .parse(process.argv);

require("fs-extra").removeSync(program.target);