// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap    = require('tap');
var events = require('events');
var https  = require('https');
var path   = require('path');

var Console = require('../lib/console');
Console.Console = new Console({
  log: tap.comment,
  warn: tap.comment,
  error: tap.comment,
});

var startServer  = require('./server').startServer;
var startProxies = require('../lib/proxy').startProxies;
var server = null;

var emitter = new events.EventEmitter();

var proxy_port  = 0;
var server_port = 0;

var reqs = {
  'test-web': 1
};
var proc = {
  'test-web': '<command>'
};
var command = {
  proxy: proxy_port.toString(),
  sslCert: path.resolve(__dirname, 'fixtures', 'certs', 'my-server.crt.pem'),
  sslKey: path.resolve(__dirname, 'fixtures', 'certs', 'my-server.key.pem'),
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
  emitter.once('https', function(port) {
    t.assert(port, 'listening');
    proxy_port = port;
    t.end();
  });
  startProxies(reqs, proc, command, emitter, server_port);
});

tap.test('test proxies', function(t) {
  https.get({
    port: proxy_port,
    rejectUnauthorized: false
  }, function (response) {
    t.equal(response.statusCode, 200);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      t.equal(body.request.headers['x-forwarded-proto'], 'https');
      t.end();
    });
  });
});

tap.test('cleanup', function(t) {
  t.plan(2);
  server.close(t.ifErr);
  emitter.emit('killall', 'SIGINT');
  emitter.on('exit', function(code, signal) {
    t.pass('proxy exitted');
  });
});
