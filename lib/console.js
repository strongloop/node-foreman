// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var util = require('util');
var colors = require('./colors');

function wrap(log, length, res) {
  if(!res) { res = []; }
  if(log.length <= length) {
    res.push(log);
    return res;
  } else {
    res.push(log.substr(0, length));
    return wrap(log.substr(length), length, res);
  }
}

var trimEnd = '…';
var ansiEscapes = /\x1b\[(\d+([A-GJKSTm]|;\d+[Hf])|6n|s|u|\?25[lh])/g;

function stripANSI(str) {
  return str.replace(ansiEscapes, '');
}

// Try to leave the escape sequences intact if possible, but strip them
// if we need to trim the line so that we don't put the terminal in a weird
// state by stripping a reset code.
function trim(line, n) {
  line = line.replace(/\s+$/, ''); // aka, .trimRight()
  var stripped = stripANSI(line);
  if (stripped.length <= n) {
    return line;
  } else {
    return stripped.substr(0, n) + trimEnd;
  }
}

function Console(logger) {
  logger = logger || console;
  this.padding = 25;

  this.trimline  = 10;
  this.wrapline = 500;

  this.fmt = function fmt() {
    return util.format.apply(null, arguments);
  };

  this.pad = function pad(string, n) {
    var l = string.length;
    var o = string;
    for(var i = l; i < n; i++) {
      o += " ";
    }
    return o;
  };

  this.trim = trim;

  // Process Specific Loggers //
  this.info = function info(key, proc, string) {
    var stamp = (new Date().toLocaleTimeString()) + " " + key;
    logger.log(proc.color(this.pad(stamp,this.padding)), colors.cyan(string));
  };

  this.error = function error(key, proc, string) {
    var stamp = (new Date().toLocaleTimeString()) + " " + key;
    logger.error(proc.color(this.pad(stamp,this.padding)), colors.red(string));
  };

  this.log = function log(key, proc, string) {
    var self = this;

    if(self.raw) {
      logger.log(string);
      return;
    }

    string.split(/\n/).forEach(function(line) {

      if (line.trim().length === 0) { return; }

      var stamp = (new Date().toLocaleTimeString()) + " " + key;

      if(self.trimline>0){
        line = self.trim(line,self.trimline);
      }

      var delimiter = " | ";

      var wrapline;
      if(self.wrapline === 0) {
        wrapline = line.length;
      } else {
        wrapline = self.wrapline;
      }

      wrap(line, wrapline).forEach(function(l) {
        logger.log(proc.color(self.pad(stamp,self.padding) + delimiter), l);
        delimiter = " |  > ";
      });

    });
  };

  // Foreman Loggers //

  this.Alert = function Alert() {
    logger.log(colors.green('[OKAY] '+ this.fmt.apply(null, arguments)));
  };

  this.Done = function Info() {
    logger.log(colors.cyan('[DONE] ' + this.fmt.apply(null, arguments)));
  };

  this.Warn = function Warn() {
    logger.warn(colors.yellow('[WARN] ' + this.fmt.apply(null, arguments)));
  };

  this.Error = function Error() {
    logger.error(colors.bright_red('[FAIL] ' + this.fmt.apply(null,arguments)));
  };

}

module.exports = Console;
Console.Console = new Console();
