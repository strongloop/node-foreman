var ppath   = require('path')
var mu      = require('mu2');
var fs      = require('fs');

var display = require('./console').Console

// Upstart Export //

mu.root = __dirname + '/upstart'

function render(filename,conf,callback){
    var out = "";
    var muu = mu.compileAndRender(filename, conf)
    muu.on('data', function (data) {
        out += data;
    })
    muu.on('end',function(){
        callback(out);
    });
}

function writeout(path){
	return function(data){
	    fs.writeFileSync(path,data);
	    display.Alert('Wrote  :',ppath.normalize(path));
	}
}

function upstart(conf,outdir){
    var path = outdir + "/" + conf.application + ".conf";
    var out  = "";
    render('foreman.conf', conf, writeout(path) )
}

function upstart_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
    render('foreman-APP.conf', conf, writeout(path) )
}

function upstart_app_n(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
    render('foreman-APP-N.conf', conf, writeout(path) )
}

module.exports.upstart       = upstart
module.exports.upstart_app   = upstart_app
module.exports.upstart_app_n = upstart_app_n