// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var prog = require('child_process');

var cons = require('./console').Console;

function startForward(port, hostname, emitter) {
  var proc = prog.fork(__dirname + '/../forward.js', [], {
    env: {
      PROXY_PORT: port,
      PROXY_HOST: hostname || '<ANY>'
    }
  });
  cons.Alert('Forward Proxy Started in Port %d', port);
  if(hostname) {
    cons.Alert('Intercepting requests to %s through forward proxy', hostname);
  } else {
    cons.Alert('Intercepting ALL requests through forward proxy');
  }
  emitter.once('killall', function(signal) {
    cons.Done('Killing Forward Proxy Server on Port %d',port);
    proc.kill(signal);
  });
}

module.exports.startForward = startForward;
