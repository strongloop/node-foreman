var http = require('http');
var env = process.env;

console.log("Starting Server");
console.log("Listening to Port", env.PORT);
console.log("Listening to Address", env.BIND);
console.log("Conncting to MySQL '%s' as '%s' with Password '%s'",
	env.MYSQL_HOST,
	env.MYSQL_USER,
	env.MYSQL_PASS);
console.log("Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing.")

http.createServer(function(req,res){
	console.log("Ping");
	res.write("PONG\n");
	res.end();
}).listen(process.env.PORT);
