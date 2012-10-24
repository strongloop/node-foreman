var http = require('http');
var httpProxy = require('http-proxy');

function startForward(proxyPort){

	var proxy = httpProxy.createServer(function (req, res, proxy) {
		
		var match = req.headers.host.match(/:(\d+)/)
		var port  = match ? match[1] : 80;
		var host  = '127.0.0.1';
		
		var target = {
			host: host,
			port: port
		}
		
		var urlmatch = req.url.match(/http:\/\/[^/]*:?[0-9]*(\/.*)$/);
		
		if(urlmatch){
			req.url = urlmatch[1];
		}else{
			req.url = '/';
		}
		
		proxy.proxyRequest(req,res,target);
		
	});
	
	proxy.listen(proxyPort,function(){
		if(process.getuid()==0) process.setuid( process.env.SUDO_USER );
	});
	
};

startForward(process.env.PROXY_PORT);
