// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap    = require('tap');
var events = require('events');
var http   = require('http');

var Console = require('../lib/console');
Console.Console = new Console({
  log: tap.comment,
  warn: tap.comment,
  error: tap.comment,
});

var startServer  = require('./server').startServer;
var startProxies = require('../lib/proxy').startProxies;
var servers = [];

var emitter = new events.EventEmitter();

var proxy_port  = [];
var server_port = [];

var reqs = {
  'test-web': 1,
  'test-api': 1,
};
var proc = {
  'test-web': '<command>',
  'test-api': '<command>'
};
var command = {
  proxy: '0,0',
};

tap.test('start server 1', function(t) {
  servers[0] = startServer(0, emitter).on('listening', function() {
    t.comment('test server listening:', this.address());
    t.assert(this.address());
    server_port[0] = this.address().port;
    t.end();
  });
});

tap.test('start server 2', function(t) {
  servers[1] = startServer(0, emitter).on('listening', function() {
    t.comment('test server listening:', this.address());
    t.assert(this.address());
    server_port[1] = this.address().port;
    t.end();
  });
});

tap.test('start proxies', function(t) {
  t.plan(2);
  emitter.on('http', function(port) {
    proxy_port.push(port);
    t.assert(port, 'listening: ' + port);
    t.comment('proxy ports: ', proxy_port);
  });
  startProxies(reqs, proc, command, emitter, server_port);
});

tap.test('test proxies', function(t) {
  t.plan(2*2);
  t.comment('testing proxy on port ' + proxy_port[0]);
  http.get({ port: proxy_port[0] }, verifyResponse).on('error', t.ifErr);
  t.comment('testing proxy on port ' + proxy_port[1]);
  http.get({ port: proxy_port[1] }, verifyResponse).on('error', t.ifErr);
  function verifyResponse(response) {
    t.equal(response.statusCode, 200);
    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      t.equal(body.request.headers['x-forwarded-proto'], 'http');
    });
  }
});

tap.test('cleanup', function(t) {
  t.plan(4);
  servers[0].close(t.ifErr);
  servers[1].close(t.ifErr);
  emitter.on('exit', function(code, signal) {
    // to ensure process lives long enough to finish logging
    setTimeout(function noop(){}, 200);
    t.ok(code || signal);
  });
  emitter.emit('killall', 'SIGINT');
});
