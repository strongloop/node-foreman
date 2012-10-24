#!/usr/bin/env node

var http = require('http');
var env = process.env;

console.log("Starting Server");
console.log("Listening to Port", env.PORT);
console.log("Listening to Address", env.BIND);
console.log("Conncting to MySQL '%s' as '%s' with Password '%s'",
	env.MYSQL_HOST,
	env.MYSQL_USER,
	env.MYSQL_PASS);

http.createServer(function(req,res){
	console.log("Ping");
	res.write("PONG\n");
	res.end();
}).listen(process.env.PORT);
