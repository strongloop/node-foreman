// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');
var events = require('events');
var https  = require('https');

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
  proxy: proxy_port.toString(),
  sslCert: './fixtures/certs/my-server.crt.pem',
  sslKey: './fixtures/certs/my-server.key.pem'
};

startServer(0, emitter).on('listening', function() {
  console.error('test server listening:', this.address());
  startProxies(reqs, proc, command, emitter, this.address().port);
  emitter.once('https', function(port) {
    proxy_port = port;
    test_proxy();
  });
});

function test_proxy() {
  https.get({
    port: proxy_port,
    rejectUnauthorized: false
  }, function (response) {
    assert.equal(response.statusCode, 200);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      assert.equal(body.request.headers['x-forwarded-proto'], 'https');

      // Only after the response has been returned can we shut down properly
      emitter.emit('killall', 'SIGINT');
    });
  });
}
