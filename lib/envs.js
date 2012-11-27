var fs   = require('fs')
var cons = require('./console').Console

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
    
    var env
    
    if(!fs.existsSync(path)){
    	
		cons.Warn("No ENV file found")
		env = {PATH:process.env.PATH}
		
    } else {
	
	    var data = fs.readFileSync(path);
	
	    try{
			var envs_json = JSON.parse(data)
	        env = flattenJSON(envs_json,"",{});
			cons.Alert("Loaded ENV %s File as JSON Format",path);
	    }catch(e){
	        env = KeyValue(data);
	        cons.Alert("Loaded ENV %s File as KEY=VALUE Format",path);
	    }
    	
		env.PATH = process.env.PATH
	}
	
    return env;
}

module.exports.loadEnvs    = loadEnvs
module.exports.KeyValue    = KeyValue
