// Copyright IBM Corp. 2015,2016. All Rights Reserved.
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

var emitter = new events.EventEmitter();
var server = null;

var proxy_port  = 0;
var server_port = 0;

var reqs = {
  'test-web': 1
};
var proc = {
  'test-web': '<command>'
};
var command = {
  proxy: proxy_port.toString()
};

tap.test('start server', function(t) {
  server = startServer(0, emitter).on('listening', function() {
    t.comment('test server listening:', this.address());
    t.assert(this.address());
    server_port = this.address().port;
    t.end();
  });
});

tap.test('start proxies', function(t) {
  emitter.once('http', function(port) {
    t.assert(port, 'listening');
    proxy_port = port;
    t.end();
  });
  startProxies(reqs, proc, command, emitter, server_port);
});

tap.test('test proxies', function(t) {
  http.get({
    port: proxy_port
  }, function (response) {
    t.equal(response.statusCode, 200);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      t.equal(body.request.headers['x-forwarded-proto'], 'http');

      t.end();
    });
  });
});

tap.test('test proxy failure', function(t) {
  server.close();
  http.get({
    port: proxy_port,
    path: 'http://foreman.com:' + server_port + '/',
  }, verify);
  function verify(response) {
    t.equal(response.statusCode, 500);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      t.match(body, /Upstream Proxy Error/i);
      t.end();
    });
  }
});

tap.test('cleanup', function(t) {
  emitter.on('exit', function(code, signal) {
    // to ensure process lives long enough to finish logging
    setTimeout(function noop(){}, 200);
    t.pass('proxy exitted');
    t.end();
  });
  emitter.emit('killall', 'SIGINT');
});
