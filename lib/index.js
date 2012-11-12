var util = require('util')
var cols = require('colors')

var Console = function(padding){
	
	this.trimline = 0
	
	this.fmt = function fmt(){
	    return util.format.apply(null,arguments);
	}

	this.pad = function pad(string,n){
	    var l = string.length;
	    var d = n - l;
	    var o = string;
	    for(i=l;i<n;i++){
	        o += " "
	    }
	    return o + " | ";
	}


	// Process Specific Loggers //

	this.trim = function trim(line,n){
		var end = '';
		if(line.length > n){
			end = '…'
		}
		return line.substr(0,n) + end;
	}

	this.info = function info(key,proc,string){
	    var stamp = (new Date().toLocaleTimeString()) + " " + key;
	    console.log(proc.color(this.pad(stamp,padding)),string.white);
	}
	
	this.Info = function info(key,proc,string){
	    var stamp = (new Date().toLocaleTimeString()) + " " + key;
	    console.log(proc.color(this.pad(stamp,padding)),string.white.bold);
	}

	this.log = function log(key,proc,string){
		var self = this;
	    string.split(/\n/).forEach(function(line){

	        if (line.trim().length==0) return;

	        var stamp = (new Date().toLocaleTimeString()) + " " + key;
		
			if(this.trimline>0){
				line = self.trim(line,command.trim);
			}else if(this.trimline==0){
				line = self.trim(line,process.stdout.columns - padding - 5);
			}
		
	        console.log(proc.color(self.pad(stamp,padding)),line);
	    });
	}

	// Foreman Loggers //

	this.Alert = function Alert(){
	    console.log( '[OKAY] '.green + this.fmt.apply(null,arguments).green );
	}
	
	this.Warn = function Warn(prefix){
	    console.warn('[WARN] '.yellow + this.fmt.apply(null,arguments).yellow );
	}

	this.Error = function Error(){
	    console.error( '[FAIL] '.bold.red + this.fmt.apply(null,arguments).bold.red );
	}

}

module.exports.Console = Console