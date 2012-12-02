var util = require('util')
var cols = require('colors')

function wrap(log,length,res){
	if(!res) res=[]
	if(log.length <= length){
		res.push(log)
		return res
	}else{
		res.push(log.substr(0,length))
		return wrap(log.substr(length),length,res)
	}
}

var Console = new function(){
	
	this.padding = 25
	
	this.trimline  = 10
	this.wrapline = 500
	
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
	    return o
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
	    console.log(proc.color(this.pad(stamp,this.padding)),string.cyan);
	}
	
	this.Info = function info(key,proc,string){
	    var stamp = (new Date().toLocaleTimeString()) + " " + key;
	    console.log(proc.color(this.pad(stamp,this.padding)),string.cyan.bold);
	}

	this.log = function log(key,proc,string){
		var self = this;
	    string.split(/\n/).forEach(function(line){

	        if (line.trim().length==0) return;

	        var stamp = (new Date().toLocaleTimeString()) + " " + key;
			
			if(self.trimline>0){
				line = self.trim(line,self.trimline);
			}
			
			var delimiter = " | "
			
			var wrapline
			if(self.wrapline==0){
				wrapline = line.length
			}else{
				wrapline = self.wrapline
			}
			
			wrap(line,wrapline).forEach(function(l){
				console.log(proc.color(self.pad(stamp,self.padding) + delimiter),l.trim());
				delimiter = " |  > "
			})
			
	    });
	}

	// Foreman Loggers //

	this.Alert = function Alert(){
	    console.log( '[OKAY] '.green + this.fmt.apply(null,arguments).green );
	}
	
	this.Done = function Info(){
		console.log( '[DONE] '.cyan + this.fmt.apply(null,arguments).cyan );
	}
	
	this.Warn = function Warn(){
	    console.warn('[WARN] '.yellow + this.fmt.apply(null,arguments).yellow );
	}

	this.Error = function Error(){
	    console.error( '[FAIL] '.bold.red + this.fmt.apply(null,arguments).bold.red );
	}

}

module.exports.Console = Console