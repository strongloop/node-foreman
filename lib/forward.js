var prog = require('child_process')

var cons = require('./console').Console

function startForward(port,emitter){
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

module.exports.startForward = startForward