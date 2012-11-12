var ppath   = require('path')
var mu      = require('mu2');
var fs      = require('fs');
var cons    = require('./index').Console

// Upstart Export //

function upstart(conf,outdir){
    var out = "";
    mu
    .compileAndRender('foreman.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = outdir + "/" + conf.application + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
    });
}

function upstart_app(conf,outdir){
    var out = "";
    mu
    .compileAndRender('foreman-APP.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
    });
}

function upstart_app_n(conf,outdir){
    var out = "";
    mu
    .compileAndRender('foreman-APP-N.conf', conf)
    .on('data', function (data) {
        out += data;
    })
    .on('end',function(){
        var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
        fs.writeFileSync(path,out);
        cons.Alert('Wrote  :',ppath.normalize(path));
    });
}

module.exports.upstart       = upstart
module.exports.upstart_app   = upstart_app
module.exports.upstart_app_n = upstart_app_n