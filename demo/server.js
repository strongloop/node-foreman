#!/usr/bin/env node

var env = process.env;
console.log(env);
console.log("Starting Server");
console.log("Listening to Port", env.PORT);
console.log("Listening to Address", env.BIND);
console.log("Conncting to MySQL '%s' as '%s' with Password '%s'",
	env.MYSQL_HOST,
	env.MYSQL_USER,
	env.MYSQL_PASS);

console.log("Server Active for %d Second",process.argv[2]/1000);
setTimeout(function(){
    console.log("Server Shutting Down")
},parseInt(process.argv[2]));
