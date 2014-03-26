var util = require('util')
var colors = require('./colors')

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

function Console(logger) {
	logger = logger || console
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
	    logger.log(proc.color(this.pad(stamp,this.padding)),
					colors.cyan(string));
	}
	
	this.Info = function info(key,proc,string){
	    var stamp = (new Date().toLocaleTimeString()) + " " + key;
	    logger.log(proc.color(this.pad(stamp,this.padding)),
					colors.bright_cyan(string));
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
				logger.log(proc.color(self.pad(stamp,self.padding) + delimiter),l.trim());
				delimiter = " |  > "
			})
			
	    });
	}

	// Foreman Loggers //

	this.Alert = function Alert(){
	    logger.log( colors.green('[OKAY] '+ this.fmt.apply(null,arguments)) );
	}
	
	this.Done = function Info(){
		logger.log( colors.cyan('[DONE] ' + this.fmt.apply(null,arguments)) );
	}
	
	this.Warn = function Warn(){
	    logger.warn( colors.yellow('[WARN] ' + this.fmt.apply(null,arguments)) );
	}

	this.Error = function Error(){
	    logger.error( colors.bright_red('[FAIL] ' + this.fmt.apply(null,arguments)) );
	}

}


module.exports = Console
Console.Console = new Console()
