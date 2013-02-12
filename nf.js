#!/usr/bin/env node

var util    = require('util');
var path    = require('path');
var events  = require('events');
var fs      = require('fs');

var program = require('commander');
var display = require('./lib/console').Console

var package = JSON.parse(
    fs.readFileSync(path.join(__dirname,'package.json'),'utf-8')
);

program.version(package.version);
program.option('-j, --procfile <FILE>' , 'load profile FILE','Procfile');
program.option('-e, --env      <FILE>' ,'use FILE to load environment','.env');
program.option('-p, --port     <PORT>' ,'start indexing ports at number PORT',5000);

var command;

// Foreman Event Bus/Emitter //

var emitter = new events.EventEmitter();
emitter.once('killall',function(){
    display.Done("Killing All Processes");
})
emitter.setMaxListeners(50);

var _proc = require('./lib/proc')
var start = _proc.start

var _procfile = require('./lib/procfile')
var procs     = _procfile.procs
var loadProc  = _procfile.loadProc

var _envs       = require('./lib/envs')
var loadEnvs    = _envs.loadEnvs

var _requirements     = require('./lib/requirements')
var getreqs           = _requirements.getreqs
var calculatePadding  = _requirements.calculatePadding

var startProxies = require('./lib/proxy').startProxies
var startForward = require('./lib/forward').startForward

// Kill All Child Processes on SIGINT
process.once('SIGINT',function userkill(){
	console.log()
    display.Warn('Interrupted by User');
    emitter.emit('killall');
});

program
.command('start')
.usage('[Options] [Processes] e.g. web=1,log=2,api')
.option('-s, --showenvs'             ,'show ENV variables on start',false)
.option('-x, --proxy     <PORT>'     ,'start a load balancing proxy on PORT')
.option('-f, --forward   <PORT>'     ,'start a forward proxy on PORT')
.option('-i, --intercept <HOSTNAME>' ,'set forward proxy to intercept HOSTNAME',null)
.option('-t, --trim      <N>'        ,'trim logs to N characters',0)
.option('-w, --wrap'                 ,'wrap logs (negates trim)')
.description('Start the jobs in the Procfile')
.action(function(command_left,command_right){

	command = command_right || command_left;

    var envs = loadEnvs(program.env);

    var proc = loadProc(program.procfile,envs);

    if(!proc) return;

	if(command.showenvs){
		for(key in envs){
			display.Alert("env %s=%s",key,envs[key]);
		}
	}

    var reqs = getreqs(program.args[0],proc);

    display.padding  = calculatePadding(reqs);

	if(command.wrap){
		display.wrapline = process.stdout.columns - display.padding - 7
		display.trimline = 0
		display.Alert('Wrapping display Output to %d Columns',display.wrapline)
	}else{
		display.trimline = command.trim || process.stdout.columns - display.padding - 5
		if(display.trimline>0){
			display.Alert('Trimming display Output to %d Columns',display.trimline)
		}
	}

	if(command.forward) startForward(command.forward,command.intercept,emitter)

	startProxies(reqs,proc,command,emitter,program.port);

	if(process.getuid && process.getuid()==0) process.setuid(process.env.SUDO_USER);

    start(proc,reqs,envs,program.port,emitter);
});

var upstart = require('./lib/upstart')

program
.command('export')
.option('-a, --app  <NAME>' ,'export upstart application as NAME','foreman')
.option('-u, --user <NAME>' ,'export upstart user as NAME','root')
.option('-o, --out  <DIR>'  ,'export upstart files to DIR','.')
.option('-g, --gid  <GID>'  ,'set gid of upstart config to GID')
.option('-l, --log  <DIR>'  ,'specify upstart log directory','/var/log')
.option('-t, --type <TYPE>' ,'export file to TYPE (default upstart)','upstart')
.description('Export to an upstart job independent of foreman')
.action(function(command_left,command_right){

	command = command_right || command_left;

    var envs = loadEnvs(program.env);

    var procs = loadProc(program.procfile,envs);

    if(!procs) return;

    var req  = getreqs(program.args[0],procs);

    // Variables for Upstart Template
    var config = {
        application : command.app,
        cwd         : process.cwd(),
        user        : command.user,
        logs        : command.log,
        envs        : envs,
        group       : command.gid || command.user
    };

    config.envfile = path.resolve(program.env)

    var writeout
    if(upstart[command.type]){
        writeout = upstart[command.type]
    }else{
        return display.Error("Unknown Export Format",command.type)
    }

    // Check for Upstart User
    // friendly warning - does not stop export
    var user_exists = false;
    fs.readFileSync('/etc/passwd')
    .toString().split(/\n/).forEach(function(line){
        if(line.match(/^[^:]*/)[0] == config.user){
            user_exists = true;
        }
    })
    if(!user_exists) display.Warn(display.fmt("User %s Does Not Exist on System",config.user));

    // Remove Old Upstart Files
    // Must Match App Name and Out Directory
    fs.readdirSync(command.out).forEach(function(file){
        var x = file.indexOf(command.app);
        if(x==0){
            var p = path.join(command.out,file);
            display.Warn("Unlink : %s".yellow.bold,p);
            fs.unlinkSync(p);
        }
    });

    var baseport = parseInt(program.port);
    var baseport_i = 0;
    var baseport_j = 0;

    config.processes=[]

    // This is ugly because of shitty support for array copying
    // Cleanup is definitely required
    for(key in req){

        var c = {};
        var proc = procs[key];

        if (!proc){
            display.Warn("Required Key '%s' Does Not Exist in Procfile Definition",key);
            continue;
        }

        config.processes.push({process:key})
        c.process=key;
        c.command=proc.command + " " + proc.args.join(' ');

        for(_ in config){
            c[_] = config[_];
        }

        var n = req[key];

        c.numbers = [];
        for(i=1;i<=n;i++){

            var conf = {};
            conf.number = i;

            for(_ in c){
                conf[_] = c[_];
            }

            conf.port = conf.envs.PORT = baseport + baseport_i + baseport_j*100;


            var envl = [];
            for(key in envs){
                envl.push({
                    key: key,
                    value: envs[key]
                })
            }

            conf.envs = envl;

            // Write the APP-PROCESS-N.conf File
            writeout.foreman_app_n(conf,command.out);

            baseport_i++;
            c.numbers.push({number:i})
        }

        // Write the APP-Process.conf File
        writeout.foreman_app(c,command.out);

        baseport_i=0;
        baseport_j++;
    }

    // Write the APP.conf File
    writeout.foreman(config,command.out);

});

program.parse(process.argv);

if(program.args.length==0) {
	console.log('   _____                           '.cyan)
	console.log('  |   __|___ ___ ___ _____ ___ ___ '.cyan)
	console.log('  |   __| . |  _| -_|     |   |   |'.yellow)
	console.log('  |__|  |___|_| |___|_|_|_|_^_|_|_|'.magenta)
	program.help();
}
