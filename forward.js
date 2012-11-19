var url  = require('url')
var http = require('http');
var httpProxy = require('http-proxy');

function startForward(proxyPort,proxyHost){
	
	var proxy = httpProxy.createServer(function (req, res, proxy) {
		
		var _url  = url.parse(req.url)
		
		var dest  = _url.hostname
		var port  = _url.port || 80
		var host  = '127.0.0.1';
		
		var target
		if(proxyHost=='<ANY>' || proxyHost == dest){
		
			target = {
				host: host,
				port: port
			}
		
			var urlmatch = req.url.match(/http:\/\/[^/]*:?[0-9]*(\/.*)$/);
		
			if(urlmatch){
				req.url = urlmatch[1];
			}else{
				req.url = '/';
			}
			
		}else{
			target = {
				host: dest,
				port: port
			}
		}
		proxy.proxyRequest(req,res,target);
		
	});
	
	proxy.listen(proxyPort,function(){
		if(process.getuid()==0) process.setuid( process.env.SUDO_USER );
	});
	
};

startForward(process.env.PROXY_PORT,process.env.PROXY_HOST);
