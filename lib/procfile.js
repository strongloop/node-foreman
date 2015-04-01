var fs   = require('fs');
var cons = require('./console').Console;

// Parse Procfile
function procs(procdata){

  var processes = {};

  procdata.toString().split(/\n/).forEach(function(line) {
    if(!line || line[0] === '#') { return; }

    var tuple = /^([A-Za-z0-9_-]+):\s*(.+)$/m.exec(line);

    var prockey = tuple[1].trim();
    var command = tuple[2].trim();

    if(!prockey) {
      return cons.Warn('Syntax Error in Procfile, Line %d: No Prockey Found');
    }

    if(!command) {
      return cons.Warn('Syntax Error in Procfile, Line %d: No Command Found');
    }

    processes[prockey] = command;
  });

  return processes;
}

// Look for a Procfile at the Specified Location
function loadProc(path) {

  try {
    var data = fs.readFileSync(path);
    return procs(data);
  } catch(e) {
    cons.Warn('No Procfile Found');
    if(fs.existsSync('package.json')) {
      cons.Alert("package.json file found - trying 'npm start'");
      return procs("web: npm start");
    } else {
      cons.Error("No Procfile found in Current Directory - See nf --help");
      return;
    }
  }

}

module.exports.loadProc = loadProc;
module.exports.procs    = procs;
