var prog       = require('child_process')

var cons       = require('./console').Console

var _colors    = require('./colors')
var colors_max = _colors.colors_max
var colors     = _colors.colors

var os         = require('os')
var platform   = os.platform()

// Run a Specific Process
// - Key is a Process Name and Number
// - Proc is an object with the launch properties
//
// i.e. web=2 becomes the web.2 key
function run(key,proc,emitter){

    var command = proc.command;
    var args    = proc.args;
    var opts    = {
        env: proc.env
    };
        
    // change sub-process switch style on Windows
    if(platform === 'win32'){
        args.unshift(command);
        args = ['/C', args.join(' ')];
        command = 'cmd';
        opts.windowsVerbatimArguments = true;
    }

    var cmd = prog.spawn(command,args,opts);

    cmd.stdout.on('data',function(data){
        cons.log(key,proc,data.toString());
    });
    
    cmd.stderr.on('data',function(data){
        cons.log(key,proc,data.toString());
    });
    
    cmd.on('close',function(code){
        if(code==0){
            cons.info(key,proc,"Exited Successfully");
        }else{
            cons.Info(key,proc,"Exited Abnormally");
        }
    });
    
    cmd.on('exit',function(code){
        emitter.emit('killall');
    });
    
    emitter.on('killall',function(){
        cmd.kill();
    });

}

// Figure Out What to Start Based on Procfile Processes
// And Requirements Passed as Command Line Arguments
//
// e.g. web=2,api=3 are requirements
function start(procs,requirements,envs,portarg,emitter){

    var j = 0;
    var k = 0;
    var port = parseInt(portarg);
    
    if(port<1024)
        return cons.Error('Only Proxies Can Bind to Privileged Ports - '+
            'Try \'sudo nf start -x %s\'',port);
    
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

            run(key+"."+(i+1),p,emitter);

            j++;

        }
        j=0;
        k++;
    }
}

module.exports.start = start
module.exports.run   = run
