#!/usr/bin/env node

var util    = require('util')
var ppath   = require('path')
var program = require('commander');
var colors_ = require('colors');
var util    = require('util');
var path    = require('path');
var prog    = require('child_process');
var fs      = require('fs');
var mu      = require('mu2');
var events  = require('events');

var lib     = require('./lib/console')

mu.root = __dirname + '/upstart'

program.version('0.0.8');
program.option('-j, --procfile <file>', 'load profile FILE','Procfile');
program.option('-e, --env <file>'  ,'use FILE to load environment','.env');
program.option('-p, --port <port>' ,'start indexing ports at number PORT',5000);

var command;
var killing = 0;

// Utilities //

var _colors    = require('./lib/colors')
var colors_max = _colors.colors_max
var colors     = _colors.colors

var cons = lib.Console;

// Foreman Event Bus/Emitter //

var emitter = new events.EventEmitter();
emitter.once('killall',function(){
    cons.Error("Killing All Processes");
})
emitter.setMaxListeners(50);

var _proc = require('./lib/proc')
var run   = _proc.run
var start = _proc.start

var _procfile = require('./lib/procfile')
var procs     = _procfile.procs
var loadProc  = _procfile.loadProc

var _envs       = require('./lib/envs')
var KeyValue    = _envs.KeyValue
var flattenJSON = _envs.flattenJSON
var loadEnvs    = _envs.loadEnvs

var _requirements     = require('./lib/requirements')
var parseRequirements = _requirements.parseRequirements
var getreqs           = _requirements.getreqs
var calculatePadding  = _requirements.calculatePadding

var startProxies = require('./lib/proxy').startProxies

var startForward = require('./lib/forward').startForward

// Kill All Child Processes on SIGINT
process.once('SIGINT',function userkill(){
	console.log()
    cons.Warn('Interrupted by User');
    emitter.emit('killall');
});

program
.command('start')
.usage('[Options] [Processes] e.g. web=1,log=2,api')
.option('-s, --showenvs'    ,'show ENV variables on start',false)
.option('-x, --proxy <port>','start a load balancing proxy on PORT')
.option('-f, --forward <port>','start a forward proxy')
.option('-t, --trim <N>'    ,'trim logs to N characters',0)
.option('-w, --wrap'        ,'wrap logs (negates trim)',false)
.description('Start the jobs in the Procfile')
.action(function(command_left,command_right){
	
	command = command_right || command_left;
	
    var proc = loadProc(program.procfile);
    
    if(!proc) return;
    
    var envs = loadEnvs(program.env);
	
	if(command.showenvs){
		for(key in envs){
			cons.Alert("env %s=%s",key,envs[key]);
		}
	}
	
    var reqs = getreqs(program.args[0],proc);
    
    cons.padding  = calculatePadding(reqs);
	
	if(command.wrap){
	    cons.wrapline = process.stdout.columns - cons.padding - 7
		cons.trimline = 0
	}else{
		cons.trimline = command.trim || process.stdout.columns - cons.padding - 5
	}
	
	if(command.forward) startForward(command.forward,emitter);
	
	startProxies(reqs,proc,command,emitter,program.port);
	
	if(process.getuid()==0) process.setuid(process.env.SUDO_USER);
	
    start(proc,reqs,envs,program.port,emitter);
});

var _upstart = require('./lib/upstart')
var upstart_app_n = _upstart.upstart_app_n
var upstart_app   = _upstart.upstart_app
var upstart       = _upstart.upstart


program
.command('export')
.option('-a, --app <name>'  ,'export upstart application as NAME','foreman')
.option('-u, --user <name>' ,'export upstart user as NAME','root')
.option('-o, --out <dir>'   ,'export upstart files to DIR','.')
.description('Export to an upstart job independent of foreman')
.action(function(command_left,command_right){
	
	command = command_right || command_left;
	
    var procs = loadProc(program.procfile);

    if(!procs) return;

    var envs = loadEnvs(program.env);
    var req  = getreqs(program.args[0],procs);
    
    // Variables for Upstart Template
    var config = {
        application : command.app,
        cwd         : process.cwd(),
        user        : command.user,
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
    if(!user_exists) cons.Warn(cons.fmt("User %s Does Not Exist on System",config.user));
    
    // Remove Old Upstart Files
    // Must Match App Name and Out Directory
    fs.readdirSync(command.out).forEach(function(file){
        var x = file.indexOf(command.app);
        var y = file.indexOf(".conf");
        if(x==0 && y>0){
            var p = path.join(command.out,file);
            cons.Warn("Unlink : %s".yellow.bold,p);
            fs.unlinkSync(p);
        }
    });
    
    var baseport = parseInt(program.port);
    var baseport_i = 0;
    var baseport_j = 0;
    
    // This is ugly because of shitty support for array copying
    // Cleanup is definitely required
    for(key in req){

        var c = {};
        var proc = procs[key];

        if (!proc){
            cons.Warn("Required Key '%s' Does Not Exist in Procfile Definition",key);
            continue;
        }
        
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
            upstart_app_n(conf,command.out);

            baseport_i++;

        }

        // Write the APP-Process.conf File
        upstart_app(c,command.out);

        baseport_i=0;
        baseport_j++;
    }

    // Write the APP.conf File
    upstart(config,command.out);

});

program.parse(process.argv);

if(program.args.length==0) program.help();
