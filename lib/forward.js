var prog = require('child_process')

var cons = require('./console').Console

function startForward(port,hostname,emitter){
	var proc = prog.fork(__dirname + '/../forward.js',[],{
		env: {
			PROXY_PORT: port,
			SUDO_USER : process.env.SUDO_USER,
			PROXY_HOST: hostname || '<ANY>'
		}
	});
	cons.Alert('Forward Proxy Started in Port %d',port);
	if(hostname){
		cons.Alert('Intercepting requests to %s through forward proxy',hostname)
	}else{
		cons.Alert('Intercepting ALL requests through forward proxy')
	}
	emitter.once('killall',function(){
		cons.Done('Killing Forward Proxy Server on Port %d',port);
		proc.kill();
	})
}

module.exports.startForward = startForward