var http    = require('http');
var htproxy = require('http-proxy');

var port = parseInt(process.env.PORT);
var host = process.env.HOST;
	
var upstream_host = process.env.UPSTREAM_HOST;
var upstream_port = parseInt(process.env.UPSTREAM_PORT);
var upstream_size = parseInt(process.env.UPSTREAM_SIZE);

var addresses = [];
for(i=0;i<upstream_size;i++){
	addresses.push({
    host: upstream_host,
    port: upstream_port + i,
    protocol: 'http',
  });
}

// Proxy
var proxy = htproxy.createProxyServer();
	
// Hanle Error
proxy.on('proxyError',function(err,req,res){
	console.error("Proxy Error: ",err);
	res.writeHead(500);
	res.write("Upstream Proxy Error");
	res.end();
});
	
// Main HTTP Server
http.createServer(function (req, res) {
	
	var target = addresses.shift();
	
	proxy.web(req, res, {target: target});
	
	addresses.push(target);
	
}).listen(port,function(){
	if(process.getuid()==0) process.setuid( process.env.SUDO_USER );
})
