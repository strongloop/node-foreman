// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var prog       = require('child_process');

var cons       = require('./console').Console;

var _colors    = require('./colors');
var colors_max = _colors.colors_max;
var colors     = _colors.colors;

var os         = require('os');
var platform   = os.platform();

// Run a Specific Process
// - Key is a Process Name and Number
// - Proc is an object with the launch properties
//
// i.e. web=2 becomes the web.2 key
function run(key, proc, emitter) {
  var file, args;
  if (platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', proc.command];
  } else {
    file = '/bin/sh';
    args = ['-c', proc.command];
  }
  var child = prog.spawn(file, args, { env: proc.env });

  child.stdout.on('data', function(data) {
    cons.log(key, proc, data.toString());
  });

  child.stderr.on('data', function(data) {
    cons.log(key, proc, data.toString());
  });

  child.on('close', function(code) {
    if(code === 0) {
      cons.info(key, proc, "Exited Successfully");
    } else {
      cons.error(key, proc, "Exited with exit code " + code);
    }
  });

  emitter.on('killall', function(signal) {
    child.kill(signal);
  });

}

// Run a Specific Process Once using the ENV variables
// from the .env file
function once(input, envs, callback) {
  var file, args;
  var proc = {
    command : input,
    env     : merge(merge({}, process.env), envs)
  };

  if (platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', proc.command];
  } else {
    file = '/bin/sh';
    args = ['-c', proc.command];
  }

  var child = prog.spawn(file, args, { env: proc.env, stdio: 'inherit' });

  child.on('close', function(code) {
    callback(code);
  });
}

// Figure Out What to Start Based on Procfile Processes
// And Requirements Passed as Command Line Arguments
//
// e.g. web=2,api=3 are requirements
function start(procs, requirements, envs, portarg, emitter){

  var j = 0;
  var k = 0;
  var port = parseInt(portarg);

  if(port < 1024) {
    return cons.Error('Only Proxies Can Bind to Privileged Ports - '+
                      'Try \'sudo nf start -x %s\'', port);
  }


  for(var key in requirements) {
    var n = parseInt(requirements[key]);

    for(var i = 0; i < n; i++) {

      var color_val = (j + k) % colors_max;

      if (!procs[key]) {
        cons.Warn("Required Key '%s' Does Not Exist in Procfile Definition", key);
        continue;
      }

      var p = {
        command : procs[key],
        color   : colors[color_val],
        env     : merge(merge({}, process.env), envs)
      };

      p.env.PORT = port + j + k * 100;
      p.env.FOREMAN_WORKER_NAME = p.env.FOREMAN_WORKER_NAME || key + "." + (i + 1);

      run(key + "." + (i + 1), p, emitter);

      j++;

    }
    j = 0;
    k++;
  }
}

// Merge object b into object a
function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

module.exports.start = start;
module.exports.run   = run;
module.exports.once  = once;
