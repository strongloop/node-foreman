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
program.option('-j, --procfile <file>', 'load profile FILE','Procfile');
program.option('-e, --env <file>'  ,'use FILE to load environment','.env');
program.option('-n, --no-nvm'      ,'disable node version manager');
program.option('-p, --port <port>' ,'start indexing ports at number PORT',5000);
program.option('-a, --app <name>'  ,'export upstart application as NAME','foreman');
program.option('-u, --user <name>' ,'export upstart user as NAME','root');
program.option('-o, --out <dir>'   ,'export upstart files to DIR','.');

var padding = 25;
var killing = 0;

// Utilities //

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

function pad(string,n){
    var l = string.length;
    var d = n - l;
    var o = string;
    for(i=l;i<n;i++){
        o += " "
    }
    return o + " | ";
}


// Process Specific Loggers //

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

// Foreman Loggers //

function Alert(){
    console.log( fmt.apply(null,arguments).bold.green );
}

function Warn(){
    console.warn( fmt.apply(null,arguments).bold.yellow );
}

function Error(){
    console.error( fmt.apply(null,arguments).bold.red );
}

// Foreman Event Bus/Emitter //

var emitter = new events.EventEmitter();
emitter.once('killall',function(){
    Error("Killing All Processes");
})

// Run a Specific Process
// - Key is a Process Name and Number
// - Process is an object with the launch properties
//
// i.e. web=2 becomes the web.2 key
function run(key,process){

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

// Figure Out What to Start Based on Procfile Processes
// And Requirements Passed as Command Line Arguments
//
// e.g. web=2,api=3 are requirements
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

            run(key+"."+(i+1),p);

            j++;

        }
        j=0;
        k++;
    }
}

// Look for a Procfile at the Specified Location
function loadProc(path){
    
    try{
        var data = fs.readFileSync(program.procfile);
        return procs(data);
    }catch(e){
        if(fs.existsSync('package.json')){
            Alert("package.json file found - trying 'npm start'")
            return procs("default: npm start");
        }else{
            Error("No Procfile found in Current Directory - See nf --help");
            return;
        }
    }

}

// Parse a Key=Value File Containing Environmental Variables
function KeyValue(data){
    var env = {};
    data.toString().split(/\n/).forEach(function(line){
        if(line=='')return;
        var items = line.split('=');
        env[items[0].toUpperCase()] = items[1];
    });
    return env;
}

// Parse a JSON Document Containing Environmental Variables
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
    
    var env = {};
    
    // NVM
    var path = process.env.PATH;
    if(program.nvm){
        path = process.env.NVM_BIN + ":" + path;
    }
    env.PATH = path;
    
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
    }catch(e){
        Warn("No ENV file found");
    }
    
    return env;
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
    if(args && args.length>0){
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

// Kill All Child Processes on SIGINT
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
    .compileAndRender('foreman.conf', conf)
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
    .compileAndRender('foreman-APP.conf', conf)
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
    .compileAndRender('foreman-APP-N.conf', conf)
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
    var req  = getreqs(program.args[0],procs);
    
    // Variables for Upstart Template
    var config = {
        application : program.app,
        cwd         : process.cwd(),
        user        : program.user,
        envs        : envs
    };
    
    // Check for Upstart User
    // friendly warning - does not stop export
    var user_exists = false;
    fs.readFileSync('/etc/passwd')
    .toString().split(/\n/).forEach(function(line){
        if(line.match(/^[^:]*/)[0] == config.user){
            user_exists = true;
        }
    })
    if(!user_exists) Warn(fmt("User %s Does Not Exist on System",config.user));
    
    // Remove Old Upstart Files
    // Must Match App Name and Out Directory
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
    
    // This is ugly because of shitty support for array copying
    // Cleanup is definitely required
    for(key in req){

        var c = {};
        var proc = procs[key];

        c.process=key;
        c.command=proc.command + " " + proc.args.join(' ');

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
            
            // Write the APP-PROCESS-N.conf File
            upstart_app_n(conf);

            baseport_i++;

        }

        // Write the APP-Process.conf File
        upstart_app(c);

        baseport_i=0;
        baseport_j++;
    }

    // Write the APP.conf File
    upstart(config);

});

program.parse(process.argv);

if(program.args.length==0) program.help();
