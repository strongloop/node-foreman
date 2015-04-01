var prog = require('child_process');
var util = require('util');

var cons = require('./console').Console;

function f(key, i, ports, proc, reqs, portargs, localhost, emitter) {
  var j = i++;
  var port = ports[j];

  if(port < 1024 && process.getuid() !== 0) {
    return cons.Error('Cannot Bind to Privileged Port %s Without Permission - Try \'sudo\'',port);
  }

  if(!port) {
    return cons.Warn('No Downstream Port Defined for \'%s\' Proxy', key);
  }

  if(!(key in proc)) {
    return cons.Warn('Proxy Not Started for Undefined Key \'%s\'', key);
  }

  var upstream_size = reqs[key];
  var upstream_port = parseInt(portargs) + j * 100;

  var proxy = prog.fork(__dirname + '/../proxy.js', [], {
    env: {
      HOST: localhost,
      PORT: port,
      UPSTREAM_HOST: localhost,
      UPSTREAM_PORT: upstream_port,
      UPSTREAM_SIZE: upstream_size,
      SUDO_USER: process.env.SUDO_USER
    }
  });

  var port_targets;

  if(upstream_size === 1) {
    port_targets = util.format('%d', upstream_port);
  } else {
    port_targets = util.format('(%d-%d)', upstream_port, upstream_port + upstream_size - 1);
  }

  cons.Alert('Starting Proxy Server [%s] %s -> %s', key, port, port_targets);

  emitter.once('killall', function(signal) {
    cons.Done('Killing Proxy Server on Port %s', port);
    proxy.kill(signal);
  });

  proxy.on('exit', function(code, signal) {
    emitter.emit('killall', signal);
  });

}

function startProxies(reqs, proc, command, emitter, portargs) {

  if(command.proxy){

    var localhost = 'localhost';
    var i = 0;

    var ports = command.proxy.split(',');
    for(var key in reqs){
      f(key, i, ports, proc, reqs, portargs, localhost, emitter);
    }
  }

}

module.exports.startProxies = startProxies;
