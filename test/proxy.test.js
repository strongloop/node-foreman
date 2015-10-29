var assert = require('assert');
var events = require('events');
var http   = require('http');

var startServer  = require('./server').startServer;
var startProxies = require('../lib/proxy').startProxies;

var emitter = new events.EventEmitter();

var proxy_port  = 3000;
var server_port = 5000;

var reqs = {
  'test-web': 1
};
var proc = {
  'test-web': '<command>'
};
var command = {
  proxy: proxy_port.toString()
};

startServer(server_port, emitter);
startProxies(reqs, proc, command, emitter, server_port);

// Artificially wait a bit for the server and proxy to start up
setTimeout(test_proxy, 200);

function test_proxy() {
  http.get({
    port: proxy_port
  }, function (response) {
    assert.equal(response.statusCode, 200);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      assert.equal(body.request.headers['x-forwarded-proto'], 'http');

      // Only after the response has been returned can we shut down properly
      emitter.emit('killall', 'SIGINT');
    });
  });
}
