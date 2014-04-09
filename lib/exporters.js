var ppath   = require('path')
var mu      = require('mu2');
var fs      = require('fs');

var display = require('./console').Console

// Procfile to System Service Export //

mu.root = __dirname

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
    render('upstart/foreman.conf', conf, writeout(path) )
}

function upstart_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
    render('upstart/foreman-APP.conf', conf, writeout(path) )
}

function upstart_app_n(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
    render('upstart/foreman-APP-N.conf', conf, writeout(path) )
}


function upstart_single(conf,outdir){
    var path = outdir + "/" + conf.application + ".conf";
    var out  = "";
    render('upstart-single/foreman.conf', conf, writeout(path) )
    display.Warn('upstart-single jobs attempt to raise limits and will fail ' +
                 'to  start if the limits cannot be raised to the desired ' +
                 'levels.  Some manual editing may be required.')
}

function upstart_single_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
    render('upstart-single/foreman-APP.conf', conf, writeout(path) )
}

function systemd(conf,outdir){
    var path = outdir + "/" + conf.application + ".target";
    var out  = "";
    render('systemd/foreman.target', conf, writeout(path) )
}

function systemd_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".target";
    render('systemd/foreman-APP.target', conf, writeout(path) )
}

function systemd_app_n(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".service";
    render('systemd/foreman-APP-N.service', conf, writeout(path) )
}

export_formats = {
    "upstart": {
        foreman       : upstart,
        foreman_app   : upstart_app,
        foreman_app_n : upstart_app_n,
    },
    "upstart-single": {
        foreman       : upstart_single,
        foreman_app   : upstart_single_app,
        foreman_app_n : function noop() {},
    },
    "systemd": {
        foreman       : systemd,
        foreman_app   : systemd_app,
        foreman_app_n : systemd_app_n,
    },
}

module.exports = export_formats
