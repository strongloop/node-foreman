#!/usr/bin/env node

var program = require('commander');
var colors  = require('colors');
var util    = require('util');
var path    = require('path');
var prog    = require('child_process');
var fs      = require('fs');
var mu      = require('mu2');
var events  = require('events');

mu.root = __dirname + '/upstart'

program.version('0.0.0');
program.option('-p, --procfile <file>', 'load profile FILE','Procfile');
program.option('-e, --env <file>'  ,'use FILE to load environment','.env');
program.option('-n, --no-nvm'      ,'disable node version manager');
program.option('-p, --port <port>' ,'start indexing ports at number PORT',5000);
program.option('-a, --app <name>'  ,'export upstart application as NAME','foreman');
program.option('-u, --user <name>' ,'export upstart user as NAME',process.getuid());
program.option('-o, --out <dir>'   ,'export upstart files to DIR','.');

var padding = 25;
var killing = 0;

var colors_max = 5;
var colors = [
    function(x){return x.cyan},
    function(x){return x.yellow},
    function(x){return x.green},
    function(x){return x.magenta},
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
    var stamp = (new Date().toLocaleTimeString()) + " " + key;
    console.log(proc.color(pad(stamp,padding)),string.white.bold);
}

function log(key,proc,string){
    string.split(/\n/).forEach(function(line){
        
        if (line.trim().length==0) return;
        
        var stamp = (new Date().toLocaleTimeString()) + " " + key;
        
        console.log(proc.color(pad(stamp,padding)),line);
    });
}

function Alert(){
    console.log( fmt.apply(null,arguments).bold.green );
}

function Warn(){
    console.warn( fmt.apply(null,arguments).bold.yellow );
}

function Error(){
    console.error( fmt.apply(null,arguments).bold.red );
}

var emitter = new events.EventEmitter();
emitter.once('killall',function(){
    Error("Killing All Processes");
})

function run(key,process,n){
    
    if(n>1) log(key,process,fmt("Restarting %d Times".bold,n));
    
    var proc = prog.spawn(process.command,process.args,{
        env: process.env
    });
    
    proc.stdout.on('data',function(data){
        log(key,process,data.toString());
    });
    
    proc.stderr.on('data',function(data){
        log(key,process,data.toString());
    });
    
    proc.on('close',function(code){
        if(code==0){
            info(key,process,"Exited Successfully");
        }else{
            info(key,process,"Exited Abnormally");
        }
    });
    
    proc.on('exit',function(code){
        emitter.emit('killall');
    });
    
    emitter.on('killall',function(){
        proc.kill();
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

function start(procs,requirements,envs){
    
    var j = 0;
    var k = 0;
    var port = parseInt(program.port);
    for(key in requirements){
        var n = parseInt(requirements[key]);
        
        for(i=0;i<n;i++){
            
            var color_val = j+k % colors_max;
            
            var p = {
                command : procs[key].command,
                args    : procs[key].args,
                color   : colors[color_val],
                env     : envs
            }
            
            p.env.PORT = port + j + k*100;
            
            run(key+"."+(i+1),p,0);
            
            j++;
            
        }
        j=0;
        k++;
    }
}

function loadProc(path){
    try{
        var data = fs.readFileSync(program.procfile);
        return procs(data);
    }catch(e){
        Error("No Procfile found in Current Directory - See nf --help");
    }
}

function KeyValue(data){
    var env = {};
    data.toString().split(/\n/).forEach(function(line){
        var items = line.split('=');
        env[items[0].toUpperCase()] = items[1];
    });
    return env;
}

var prefix_delim = "_";
function flattenJSON(json,prefix,env){
    
    for(key in json){
        var item = json[key];
        if (typeof item == 'object'){
            flattenJSON(item,key.toUpperCase() + prefix_delim,env);
        }else{
            env[prefix + key.toUpperCase()] = json[key];
        }
    };
    return env;
}

function loadEnvs(path){
    try{
        var data = fs.readFileSync(path);
        
        var env;
        try{
            env = flattenJSON(JSON.parse(data),"",{});
            Alert("Loaded ENV %s File as JSON Format",path);
        }catch(e){
            env = KeyValue(data);
            Alert("Loaded ENV %s File as KEY=VALUE Format",path);
        }
        // NVM
        var path  = "/usr/local/bin:/usr/bin:/bin:"
            path += "/usr/local/sbin:/usr/sbin:/sbin"
        if(program.nvm){
            path = process.env.NVM_BIN + ":" + path;
        }
        env.PATH = path;
        
        return env;
        
    }catch(e){
        Warn("No ENV file found");
        return {};
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

function getreqs(args,proc){
    var req;
    if(args.length>0){
        // Run Specific Procs
        req = parseRequirements(args);
    }else{
        // All
        req = {};
        for(key in proc){
            req[key] = 1;
        }
    }
    return req;
}

process.on('SIGINT',function userkill(){
    Warn('Interrupted by User');
    emitter.emit('killall');
});

program
.command('start')
.description('Start the jobs in the Procfile')
.action(function(){
    var proc = loadProc(program.procfile);
    
    if(!proc) return;
    
    var envs = loadEnvs(program.env);
    var reqs = getreqs(program.args[0],proc);
    
    start(proc,reqs,envs);
});

// Upstart Export //

function upstart(conf){
    var out = "";
    mu
    .compileAndRender('nodefly.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = program.out + "/" + conf.application + ".conf";
        fs.writeFileSync(path,out);
        Alert('Wrote  : ',path);
    });
}

function upstart_app(conf){
    var out = "";
    mu
    .compileAndRender('nodefly-APP.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = program.out + "/" + conf.application + "-" + conf.process + ".conf";
        fs.writeFileSync(path,out);
        Alert('Wrote  : ',path);
    });
}

function upstart_app_n(conf){
    var out = "";
    mu
    .compileAndRender('nodefly-APP-N.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = program.out + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
        fs.writeFileSync(path,out);
        Alert('Wrote  : ',path);
    });
}

program
.command('export')
.action(function(){
    
    var procs = loadProc(program.procfile);
    
    if(!procs) return;
    
    var envs = loadEnvs(program.env);
    var req  = getreqs(program.args[1],procs);
    
    var config = {
        application : program.app,
        cwd         : process.cwd(),
        user        : program.user,
        envs        : envs
    };
    
    fs.readdirSync(program.out).forEach(function(file){
        var x = file.indexOf(program.app);
        var y = file.indexOf(".conf");
        if(x==0 && y>0){
            var p = path.join(program.out,file);
            Warn("Unlink : %s".yellow.bold,p);
            fs.unlinkSync(p);
        }
    });
    
    var baseport = program.port;
    var baseport_i = 0;
    var baseport_j = 0;
    
    for(key in req){
        
        var c = {};
        var proc = procs[key];
        
        c.process=key;
        c.command=proc.command;
        
        for(_ in config){
            c[_] = config[_];
        }
        
        var n = req[key];
        
        for(i=1;i<=n;i++){
            
            var conf = {};
            conf.number = i;
            
            for(_ in c){
                conf[_] = c[_];
            }
            
            conf.envs.PORT = baseport + baseport_i + baseport_j*100;
            
            var envl = [];
            for(key in envs){
                envl.push({
                    key: key,
                    value: envs[key]
                })
            }
            
            conf.envs = envl;
            
            upstart_app_n(conf);
            
            baseport_i++;
            
        }
        
        upstart_app(c);
        
        baseport_i=0;
        baseport_j++;
    }
    
    upstart(config);
    
});

program.parse(process.argv);

if(program.args.length==0) program.help();
