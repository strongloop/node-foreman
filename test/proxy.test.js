// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');
var events = require('events');
var http   = require('http');

var startServer  = require('./server').startServer;
var startProxies = require('../lib/proxy').startProxies;

var emitter = new events.EventEmitter();

var proxy_port  = 0;

var reqs = {
  'test-web': 1
};
var proc = {
  'test-web': '<command>'
};
var command = {
  proxy: proxy_port.toString()
};

startServer(0, emitter).on('listening', function() {
  console.error('test server listening:', this.address());
  startProxies(reqs, proc, command, emitter, this.address().port);
  emitter.once('http', function(port) {
    proxy_port = port;
    test_proxy();
  });
});

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
