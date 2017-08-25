// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs   = require('fs');
var path = require('path');
var prog = require('child_process');
var util = require('util');

var cons = require('./console').Console;

function f(key, j, ports, proc, reqs, portargs, localhost, emitter, ssl) {
  var port = parseInt(ports[j]);
  var ssl_port = (port === 80 ? 443 : (port + 443));

  if(port > 0 && port < 1024 && process.getuid() !== 0) {
    return cons.Error('Cannot Bind to Privileged Port %s Without Permission - Try \'sudo\'',port);
  }

  if(isNaN(port)) {
    return cons.Warn('No Downstream Port Defined for \'%s\' Proxy', key);
  }

  if(!(key in proc)) {
    return cons.Warn('Proxy Not Started for Undefined Key \'%s\'', key);
  }

  var upstream_size = reqs[key];
  var upstream_port = parseInt(portargs) + j * 100;

  var proxy = prog.fork(require.resolve('../proxy'), [], {
    env: {
      HOST: localhost,
      PORT: port,
      UPSTREAM_HOST: localhost,
      UPSTREAM_PORT: upstream_port,
      UPSTREAM_SIZE: upstream_size,
      SSL_CERT: ssl.cert,
      SSL_KEY: ssl.key,
      SSL_PORT: port ? ssl_port : 0
    }
  });

  var port_targets;

  if(upstream_size === 1) {
    port_targets = util.format('%d', upstream_port);
  } else {
    port_targets = util.format('(%d-%d)', upstream_port, upstream_port + upstream_size - 1);
  }

  cons.Alert('Starting Proxy Server [%s] %s -> %s', key, port, port_targets);
  if (ssl.cert && ssl.key) {
    cons.Alert('Starting Secure Proxy Server [%s] %s -> %s', key, ssl_port, port_targets);
  }

  proxy.on('message', function(msg) {
    if ('http' in msg) {
      emitter.emit('http', msg.http);
    }
    if ('https' in msg) {
      emitter.emit('https', msg.https);
    }
  });

  emitter.once('killall', function(signal) {
    cons.Done('Killing Proxy Server on Port %s', port);
    proxy.kill(signal);
  });
}

function startProxies(reqs, proc, command, emitter, portargs) {

  if ('proxy' in command) {

    var localhost = 'localhost';

    var ports = command.proxy.split(',');

    var ssl = {
      cert: '',
      key:  ''
    };
    if ((command.sslKey && !command.sslCert) ||
        (command.sslCert && !command.sslKey)) {
      cons.Warn('SSL key and cert must both be supplied for SSL support');
    }
    if (command.sslKey && command.sslCert) {
      command.sslKey = path.resolve(command.sslKey);
      command.sslCert = path.resolve(command.sslCert);
      if (!fs.existsSync(command.sslKey)) {
        cons.Warn('SSL key (%s) does not exist', command.sslKey);
      }
      else {
        ssl.key = command.sslKey;
      }
      if (!fs.existsSync(command.sslCert)) {
        cons.Warn('SSL cert (%s) does not exist', command.sslCert);
      }
      else {
        ssl.cert = command.sslCert;
      }
    }

    Object.keys(reqs).forEach(function(key, i) {
      f(key, i, ports, proc, reqs, portargs, localhost, emitter, ssl);
    });
  }

}

module.exports.startProxies = startProxies;
