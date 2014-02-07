var ppath   = require('path')
var mu      = require('mu2');
var fs      = require('fs');

var display = require('./console').Console

// Upstart Export //

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

function absoluteJoin(dir, file) {
    return ppath.join(process.cwd(), ppath.relative(process.cwd(), dir), file);
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
    render(absoluteJoin((conf.template || 'upstart'), 'foreman.conf'), conf, writeout(path) )
}

function upstart_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
    render(absoluteJoin((conf.template || 'upstart'), 'foreman-APP.conf'), conf, writeout(path) )
}

function upstart_app_n(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
    render(absoluteJoin((conf.template || 'upstart'),'foreman-APP-N.conf'), conf, writeout(path) )
}


function systemd(conf,outdir){
    var path = outdir + "/" + conf.application + ".target";
    var out  = "";
    render(absoluteJoin((conf.template || 'systemd'), 'foreman.target'), conf, writeout(path) )
}

function systemd_app(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + ".target";
    render(absoluteJoin((conf.template || 'systemd'), 'foreman-APP.target'), conf, writeout(path) )
}

function systemd_app_n(conf,outdir){
    var out = "";
    var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".service";
    render(absoluteJoin((conf.template || 'systemd'), 'foreman-APP-N.service'), conf, writeout(path) )
}

export_formats = {
    "upstart" : {
        foreman       : upstart,
        foreman_app   : upstart_app,
        foreman_app_n : upstart_app_n
    },
    "systemd" : {
        foreman       : systemd,
        foreman_app   : systemd_app,
        foreman_app_n : systemd_app_n
    }
}

module.exports = export_formats
