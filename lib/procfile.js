var fs   = require('fs')
var cons = require('./console').Console
var _process = process

// Replace a var key with it's value supporting both
// $var and ${var} types
function replaceVar(str, key, value){
  str = str.replace('$' + key, value);
  str = str.replace('${' + key + '}', value);

  return str;
}

// Parse Procfile
function procs(procdata,envs){

    var processes = {};

    procdata.toString().split(/\n/).forEach(function(line){
        if(line=='') return;

        var tuple = /^([A-Za-z0-9_]+):\s*(.+)$/m.exec(line);

        var prockey = tuple[1].trim();
        var command = tuple[2].trim();

        if(prockey=='')
            return cons.Warn('Syntax Error in Procfile, Line %d: No Prockey Found',i+1);

        if(command=='')
            return cons.Warn('Syntax Error in Procfile, Line %d: No Command Found',i+1);

        var comm = command.split(/\s/);
        var args = comm.splice(1,comm.length);

        // Substitute $variables for their values
        var key, i = 0;

        for (; i < args.length; i++) {
          if (envs) {
            for (key in envs) {
              args[i] = replaceVar(args[i], key, envs[key]);
            }
          }

          // If there's still possibly variables, then use process.env vars
          if (args[i].indexOf('$') !== -1) {
            for (key in _process.env) {
              args[i] = replaceVar(args[i], key, _process.env[key]);
            }
          }
          
          // Warn on unmatched substitutions
          if(args[i].match(/^\$\S+/)) cons.Warn('Unresovled Substitution in %s:',prockey,args[i]);
          
        }

        var process = {
            command : comm[0],
            args    : args
        };

        processes[prockey]=process;

    });

    return processes;
}

// Look for a Procfile at the Specified Location
function loadProc(path,envs){

    try{
        var data = fs.readFileSync(path);
        return procs(data,envs);
    }catch(e){
		cons.Warn('No Procfile Found')
        if(fs.existsSync('package.json')){
            cons.Alert("package.json file found - trying 'npm start'")
            return procs("web: npm start");
        }else{
            cons.Error("No Procfile found in Current Directory - See nf --help");
            return;
        }
    }

}

module.exports.loadProc = loadProc
module.exports.procs    = procs
