// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs   = require('fs');
var cons = require('./console').Console;
var path = require('path');

// Parse Procfile
function procs(procdata){

  var processes = {};

  procdata.toString().split(/\n/).forEach(function(line) {
    if(!line || line[0] === '#') { return; }

    var tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line);

    var prockey = tuple[1].trim();
    var command = tuple[2].trim();

    if(!prockey) {
      throw new Error('Syntax Error in Procfile, Line %d: No Prockey Found');
    }

    if(!command) {
      throw new Error('Syntax Error in Procfile, Line %d: No Command Found');
    }

    processes[prockey] = command;
  });

  return processes;
}

// Look for a Procfile at the Specified Location
function loadProc(filename) {

  try {
    var data = fs.readFileSync(filename);
    return procs(data);
  } catch(e) {
    cons.Warn(e.message);
    if(fs.existsSync('package.json')) {
      cons.Alert("package.json file found - trying 'npm start'");
      return procs("web: npm start");
    } else {
      cons.Error("No Procfile and no package.json file found in Current Directory - See " + path.basename(process.argv[1]) + " --help");
      return;
    }
  }

}

module.exports.loadProc = loadProc;
module.exports.procs    = procs;
