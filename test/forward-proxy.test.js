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

tap.test('start server', function(t) {
  startServer(0, emitter).on('listening', function() {
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
  http.get({
    port: proxy_port,
    path: 'http://foreman.com:' + server_port + '/',
  }, function (response) {
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

      // Only after the response has been returned can we shut down properly
      emitter.emit('killall', 'SIGINT');
      t.end();
    });
  });
});
