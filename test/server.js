var http = require('http');

/**
 * Starts an HTTP server listening on `port` that will clean up and kill itself
 * upon a 'killall' event'
 *
 * @param {Number} port - the port to listen on
 * @param {EventEmitter} emitter - the emitter to listen for 'killall' on
 * @return {http.Server}
 */
module.exports.startServer = function startServer(port, emitter) {
  var server = http.createServer(function (request, response) {
    response.statusCode = 200;
    // Send back the request headers so the test can validate that the
    // x-forwarded-* headers were set.
    response.write(JSON.stringify({
      request: {
        headers: request.headers
      }
    }));
    response.end();
  });

  // Keep track of the sockets so that we can destroy them and end the process
  // gracefully.
  var nextSocketId = 0;
  var sockets = [];

  server.on('connection', function (socket) {
    var socketId = nextSocketId++;
    sockets[socketId] = socket;
    socket.on('close', function () {
      delete sockets[socketId];
    });
  });

  server.listen(port);

  emitter.once('killall', function () {
    server.close();
    for (var socketId in sockets) {
      sockets[socketId].destroy();
    }
  });

  return server;
};
