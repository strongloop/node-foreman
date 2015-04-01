var colors  = require('./colors');
var ppath   = require('path');
var mu      = require('mu2');
var fs      = require('fs');

var display = require('./console').Console;

// Procfile to System Service Export //

mu.root = __dirname;

function render(filename, conf, callback) {
  var out = "";
  var muu = mu.compileAndRender(filename, conf);
  muu.on('data', function (data) {
    out += data;
  });
  muu.on('end', function(){
    callback(out);
  });
}

function templatePath(conf, type, file) {
  if(conf.template) {
    return ppath.resolve(conf.template, file);
  } else {
    return ppath.resolve(__dirname, type, file);
  }
}

function writeout(path) {
  return function(data) {
    if (fs.existsSync(path)) {
      display.Warn(colors.bright_yellow('Replacing: %s'), path);
    }

    fs.writeFileSync(path,data);
    display.Alert('Wrote  :',ppath.normalize(path));
  };
}

function upstart(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  render(templatePath(conf, 'upstart', 'foreman.conf'), conf, writeout(path));
}

function upstart_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
  render(templatePath(conf, 'upstart', 'foreman-APP.conf'), conf, writeout(path));
}

function upstart_app_n(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
  render(templatePath(conf, 'upstart','foreman-APP-N.conf'), conf, writeout(path));
}

function upstart_single(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  render(templatePath(conf, 'upstart-single', 'foreman.conf'), conf, writeout(path));
  display.Warn('upstart-single jobs attempt to raise limits and will fail ' +
               'to  start if the limits cannot be raised to the desired ' +
               'levels.  Some manual editing may be required.');
}

function upstart_single_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
  render(templatePath(conf, 'upstart-single', 'foreman-APP.conf'), conf, writeout(path));
}

function systemd(conf, outdir){
  var path = outdir + "/" + conf.application + ".target";
  render(templatePath(conf, 'systemd', 'foreman.target'), conf, writeout(path));
}

function systemd_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".target";
  render(templatePath(conf, 'systemd', 'foreman-APP.target'), conf, writeout(path));
}

function systemd_app_n(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".service";
  render(templatePath(conf, 'systemd', 'foreman-APP-N.service'), conf, writeout(path));
}

function supervisord(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  var programs = [];

  // Supervisord requires comma separated lists and they are
  // quite ugly to handle in Moustache.
  for(var i = 0; i < conf.processes.length; i++) {
    var process = conf.processes[i].process;
    var n = conf.processes[i].n;

    for(var j = 1; j <= n; j++) {
      programs.push(conf.application + "-" + process + "-" + j);
    }
  }

  conf.programs = programs.join(',');

  render(templatePath(conf, 'supervisord', 'foreman.conf'), conf, writeout(path));
}

function supervisord_app_n(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + "-" + conf.number + ".conf";
  var envs = [];

  // We have to do the same thing for env variables.
  for(var i in conf.envs) {
    var key = conf.envs[i].key;
    var value = conf.envs[i].value;

    // Some variables like 'web.1' breaks supervisor confg so we
    // escape quotes and wrap values in quotes.
    if(typeof value === 'string') {
      value = value.replace(/"/, '\\"');
    }

    envs.push(key + "=" + '"' + value  + '"');
  }

  conf.envs = envs.join(',');

  render(templatePath(conf, 'supervisord', 'foreman-APP-N.conf'), conf, writeout(path));
}

function smf_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".xml";
  render(templatePath(conf, 'smf', 'foreman-APP.xml'), conf, writeout(path));
}

var export_formats = {
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
  "supervisord": {
    foreman       : supervisord,
    foreman_app   : function noop() {},
    foreman_app_n : supervisord_app_n,
  },
  "smf": {
    foreman       : function noop() {},
    foreman_app   : smf_app,
    foreman_app_n : function noop() {},
  }
};

module.exports = export_formats;
