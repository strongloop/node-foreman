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
var startProxy = require('../lib/forward').startForward;

var emitter = new events.EventEmitter();

var proxy_port  = 0;
var server_port = 0;
var server = null;

tap.test('start server', function(t) {
  server = startServer(0, emitter).on('listening', function() {
    t.comment('test server listening:', this.address());
    t.assert(this.address());
    server_port = this.address().port;
    t.end();
  });
});

tap.test('start proxy', function(t) {
  emitter.once('http', function(port) {
    t.comment('test proxy listening:', port);
    t.assert(port, 'listening');

    proxy_port = port;
    t.end();
  });
  startProxy(0, 'foreman.com', emitter);
});


tap.test('test proxies', function(t) {
  t.plan(2*2);
  http.get({
    port: proxy_port,
    path: 'http://foreman.com:' + server_port + '/',
  }, verify);
  t.comment('ensuring proxy handles missing path');
  http.get({
    port: proxy_port,
    path: 'http://foreman.com:' + server_port,
  }, verify);
  function verify(response) {
    t.equal(response.statusCode, 200);

    var body = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      body = JSON.parse(body);
      t.match(body, {
        server: {
          port: server_port,
        },
        request: {
          headers: {
            host: 'localhost:' + proxy_port,
          }
        }
      });
    });
  }
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
  emitter.emit('killall', 'SIGINT');
  emitter.on('exit', function(code, signal) {
    // to ensure process lives long enough to finish logging
    setTimeout(function noop(){}, 200);
    t.pass('forward proxy exited');
    t.end();
  });
});
