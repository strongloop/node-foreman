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

var lib     = require('./lib')

mu.root = __dirname + '/upstart'

program.version('0.0.8');
program.option('-j, --procfile <file>', 'load profile FILE','Procfile');
program.option('-e, --env <file>'  ,'use FILE to load environment','.env');
program.option('-p, --port <port>' ,'start indexing ports at number PORT',5000);

var command;
var padding = 25;
var killing = 0;

// Utilities //

var _colors    = require('./lib/colors')
var colors_max = _colors.colors_max
var colors     = _colors.colors

var cons = new lib.Console(padding);

// Foreman Event Bus/Emitter //

var emitter = new events.EventEmitter();
emitter.once('killall',function(){
    cons.Error("Killing All Processes");
})
emitter.setMaxListeners(50);

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
        cons.log(key,process,data.toString());
    });
    
    proc.stderr.on('data',function(data){
        cons.log(key,process,data.toString());
    });
    
    proc.on('close',function(code){
        if(code==0){
            cons.info(key,process,"Exited Successfully");
        }else{
            cons.Info(key,process,"Exited Abnormally");
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
        if(line=='') return;
        
        var tuple = line.trim().split(":");

        if(tuple.length!=2)
            return cons.Warn('Syntax Error in Procfile: Line %d',i+1);

        var prockey = tuple[0].trim();
        var command = tuple[1].trim();
        
        if(prockey=='')
            return cons.Warn('Syntax Error in Procfile, Line %d: No Prockey Found',i+1);
        
        if(command=='')
            return cons.Warn('Syntax Error in Procfile, Line %d: No Command Found',i+1);
        
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
	
	if(port<1024)
		return cons.Error('Only Proxies Can Bind to Privileged Ports - '+
			'Try \'sudo nf start -x %s %s\'',port,program.args[0]);
	
    for(key in requirements){
        var n = parseInt(requirements[key]);

        for(i=0;i<n;i++){

            var color_val = (j+k) % colors_max;
            
            if (!procs[key]){
                cons.Warn("Required Key '%s' Does Not Exist in Procfile Definition",key);
                continue;
            }
            
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
            cons.Alert("package.json file found - trying 'npm start'")
            return procs("default: npm start");
        }else{
            cons.Error("No Procfile found in Current Directory - See nf --help");
            return;
        }
    }

}

// Parse a Key=Value File Containing Environmental Variables
function KeyValue(data){
    var env = {};
    data.toString().split(/\n/).forEach(function(line){
        if(line=='')return;
        var items = line.split('=',2);
        env[items[0]] = items[1];
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
    
    try{
        var data = fs.readFileSync(path);
        var env;
        try{
            env = flattenJSON(JSON.parse(data),"",{});
            cons.Alert("Loaded ENV %s File as JSON Format",path);
        }catch(e){
            env = KeyValue(data);
            cons.Alert("Loaded ENV %s File as KEY=VALUE Format",path);
        }
    }catch(e){
        cons.Warn("No ENV file found");
    }
    
    env.PATH = process.env.PATH;
    
    return env;
}

function parseRequirements(req){
    var requirements = {};
    req.toString().split(',').forEach(function(item){
        var tup = item.trim().split('=');
        var key = tup[0];
        var val;
        if(tup.length>1){
            val = parseInt(tup[1]);
        }else{
            val = 1;
        }
        
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

function calculatePadding(reqs){
    var padding = 0;
    for(key in reqs){
        var num = reqs[key];
        var len = key.length + num.toString().length;
        if (len>padding) padding=len;
    }
    return padding + 10;
}

function startProxies(reqs,proc,command){
	
	if(command.proxy){
		
		var localhost = 'localhost';
		var i=0;
		
		var ports = command.proxy.split(',');
		for(key in reqs){(function(key){
			
			var j = i++;
			
			var port = ports[j];
			
			if(port<1024 && process.getuid()!=0)
				return cons.Error('Cannot Bind to Privileged Port %s Without Permission - Try \'sudo\'',port);
			
			if(!port) return cons.Warn('No Downstream Port Defined for \'%s\' Proxy',key);
			if(!(key in proc)) return cons.Warn('Proxy Not Started for Undefined Key \'%s\'',key);
			
			var upstream_size = reqs[key];
			var upstream_port = parseInt(program.port) + j*100;
			
			var proxy = prog.fork(__dirname + '/proxy.js',[],{
				env: {
					HOST: localhost,
					PORT: port,
					UPSTREAM_HOST: localhost,
					UPSTREAM_PORT: upstream_port,
					UPSTREAM_SIZE: upstream_size,
					SUDO_USER: process.env.SUDO_USER
				}
			});
			
			var port_targets;
			if(upstream_size==1){
				port_targets = util.format('%d',   upstream_port);
			}else{
				port_targets = util.format('(%d-%d)',upstream_port, upstream_port+upstream_size-1)
			}
			
			cons.Alert('Starting Proxy Server %s -> %s', port, port_targets);
			
			emitter.once('killall',function(){
				cons.Error('Killing Proxy Server on Port %s',port);
				proxy.kill();
			})
		
			proxy.on('exit',function(){
				emitter.emit('killall');
			})
			
		})(key)}
		
	}
	
}

function startForward(port){
	var proc = prog.fork(__dirname + '/forward.js',[],{
		env: {
			PROXY_PORT: port,
			SUDO_USER : process.env.SUDO_USER
		}
	});
	cons.Alert('Forward Proxy Started in Port %d',port);
	emitter.once('killall',function(){
		cons.Error('Killing Forward Proxy Server on Port %d',port);
		proc.kill();
	})
}

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
    
    padding = calculatePadding(reqs);
    
	if(command.forward) startForward(command.forward);
	
	startProxies(reqs,proc,command);
	
	if(process.getuid()==0) process.setuid(process.env.SUDO_USER);
	
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
        var path = command.out + "/" + conf.application + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
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
        var path = command.out + "/" + conf.application + "-" + conf.process + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
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
        var path = command.out + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
    });
}

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
