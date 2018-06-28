// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var http = require('http');
var url  = require('url');
var httpProxy = require('http-proxy');

function startForward(proxy_port, proxy_host) {

  var proxy = httpProxy.createProxyServer({});

  var httpServer = http.createServer(function(req, res) {

    var _url  = url.parse(req.url);

    var dest  = _url.hostname;
    var port  = _url.port || 80;
    var host  = '127.0.0.1';

    var target;
    if(proxy_host === '<ANY>' || proxy_host === dest) {

      target = {
        host: host,
        port: port
      };
      req.url = _url.path;

    } else {
      target = {
        host: dest,
        port: port
      };
    }

    proxy.web(req, res, {target: target});

  });

  proxy.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
  });

  proxy.on('error', function(err, req, res){
    console.error('Proxy Error: ', err);
    res.writeHead(500);
    res.write('Upstream Proxy Error');
    res.end();
  });

  httpServer.listen(proxy_port);
}

startForward(process.env.PROXY_PORT, process.env.PROXY_HOST);
