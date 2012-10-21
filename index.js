#!/usr/bin/env node

var program = require('commander');
var colors  = require('colors');
var util    = require('util');
var prog    = require('child_process');
var fs      = require('fs');

program.version('0.0.0');
program.option('-p, --procfile <file>', 'load profile FILE','Procfile');
program.option('-e, --env <file>'  ,'use FILE to load environment','.env');
program.option('-w, --watch <dir>' ,'watch DIR for changes');
program.option('-r, --respawn'     ,'restart process after exit');
program.option('-d, --daemonize'   ,'daemonize process; immune to hangups');
program.option('-l, --log <file>'  ,'output logs to FILE');
program.option('-d, --error <file>','output stderr to FILE');
program.option('-n, --no-nvm'      ,'disable node version manager');

var padding = 25;
var killing = 0;
var actives = [];

var colors_max = 5;
var colors = [
    function(x){return x.magenta},
    function(x){return x.cyan},
    function(x){return x.yellow},
    function(x){return x.green},
    function(x){return x.blue},
    function(x){return x.white}
];

function fmt(){
    return util.format.apply(null,arguments);
}

// Log Padding
function pad(string,n){
    var l = string.length;
    var d = n - l;
    var o = string;
    for(i=l;i<n;i++){
        o += " "
    }
    return o + " | ";
}

function info(key,proc,string){
    var stamp = (new Date().toLocaleTimeString()) + ": " + key;
    console.log(proc.color(pad(stamp,padding)),string.white.bold);
}

function log(key,proc,string){
    string.split(/\n/).forEach(function(line){
        
        if (line.trim().length==0) return;
        
        var stamp = (new Date().toLocaleTimeString()) + ": " + key;
        
        console.log(proc.color(pad(stamp,padding)),proc.color(line));
    });
}

function warn(){
    console.warn( fmt.apply(null,arguments).bold.yellow );
}

function error(){
    console.warn( fmt.apply(null,arguments).bold.red );
}

function killall(){
    if(killing==1){
        error("Killing All Processes");
    }
    killing++;
    for(i in actives){
        actives[i].kill('SIGINT');
    }
}

function run(key,process,onExit,n){
    
    if(n>1) log(key,process,fmt("Restarting %d Times".bold,n));
    
    var proc = prog.spawn(process.command,process.args,{
        env: process.env
    });
    
    actives.push(proc);
    
    proc.stdout.on('data',function(data){
        log(key,process,data.toString());
    });
    
    proc.stderr.on('data',function(data){
        log(key,process,data.toString().bold);
    });
    
    proc.on('close',function(code){
        if(code==0){
            info(key,process,"Exited Successfully");
        }else{
            info(key,process,"Exited Abnormally");
        }
    });
    
    proc.on('exit',function(code){
        if(onExit(code)){
            run(key,process,onExit,n+1)
        }
    });
}

// Parse Procfile
function procs(procdata){
    
    var i=0;
    var processes = {};
    
    procdata.toString().split(/\n/).forEach(function(line){
        var tuple = line.trim().split(":");
        
        if(tuple.length!=2) return;
        
        var prockey = tuple[0].trim();
        var command = tuple[1].trim();
        
        var comm = command.split(/\s/);
        var args = comm.splice(1,comm.length);
        
        var process = {
            command : comm[0],
            args    : args
        };
        
        processes[prockey]=process;
        
        i++;
        
    });
    
    return processes;
}

function start(procs,requirements,envs,onExit){
    var j = 0;
    for(key in requirements){
        var n = parseInt(requirements[key]);
        
        for(i=0;i<n;i++){
            
            var color_val = j % colors_max;
            
            var p = {
                command : procs[key].command,
                args    : procs[key].args,
                color   : colors[color_val],
                env     : envs
            }
            
            run(key+"."+(i+1),p,onExit,0);
            
            j++;
            
        }
    }
}

function loadProc(path){
    var data = fs.readFileSync(program.procfile);
    return procs(data);
}

function KeyValue(data){
    var env = {};
    data.toString().split(/\n/).forEach(function(line){
        var items = line.split('=');
        env[items[0]] = items[1];
    });
    return env;
}

function loadEnvs(path){
    try{
        var data = fs.readFileSync(path);
        var env;
        try{
            env = JSON.parse(data);
            console.log("Loaded ENV File as JSON");
        }catch(e){
            env = KeyValue(data);
            console.log("Loaded ENV File as Key=Value");
        }
        return env;
    }catch(e){
        warn("No ENV file found");
    }
}

function parseRequirements(req){
    var requirements = {};
    req.toString().split(',').forEach(function(item){
        var tup = item.trim().split('=');
        var key = tup[0];
        var val = parseInt(tup[1]);
        requirements[key] = val;
    });
    return requirements;
}

function userkill(){
    warn('Process Interrupted by User');
    killall();
}

process.on('SIGHUP',userkill);
process.on('SIGINT',userkill);

program
.command('start')
.action(function(){
    var envs = loadEnvs(program.env);
    var proc = loadProc(program.procfile);
    
    var req;
    if(program.args.length==2){
        // Run Specific Procs
        req = parseRequirements(program.args[0]);
    }else{
        // All
        req = {};
        for(key in proc){
            req[key] = 1;
        }
    }
    var onExit = function(code){
        if(code==0 && program.respawn && killing==0){
            return true;
        }else{
            if(code!=0) { killall(); }
            return false;
        }
    }
    
    // NVM
    var path  = "/usr/local/bin:/usr/bin:/bin:"
        path += "/usr/local/sbin:/usr/sbin:/sbin"
    if(program.nvm){
        path = process.env.NVM_BIN + ":" + path;
    }
    envs.PATH = path;
    
    start(proc,req,envs,onExit);
});

program
.command('export')
.action(function(){
    error("Method Not Yet Implementedd".red);
});
program
.command('stop')
.action(function(){
    error("Method Not Yet Implementedd".red);
});;

program.parse(process.argv);

if(program.watch) 
    warn("FileWatch Not Yet Implemented");
if(program.daemonize)
    warn("Daemonize Not Yet Implemented");

if(program.args.length==0) program.help();
