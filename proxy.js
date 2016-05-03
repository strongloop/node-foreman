// Copyright IBM Corp. 2012,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs      = require('fs');
var http    = require('http');
var https   = require('https');
var htproxy = require('http-proxy');

var port = parseInt(process.env.PORT);

var upstream_host = process.env.UPSTREAM_HOST;
var upstream_port = parseInt(process.env.UPSTREAM_PORT);
var upstream_size = parseInt(process.env.UPSTREAM_SIZE);
var sslCert       = process.env.SSL_CERT;
var sslKey        = process.env.SSL_KEY;
var sslPort       = parseInt(process.env.SSL_PORT);

var addresses = [];
for(var i = 0; i < upstream_size; i++) {
  addresses.push({
    host: upstream_host,
    port: upstream_port + i,
    protocol: 'http',
  });
}

// Proxy
var proxy = htproxy.createProxyServer({
  // Set the x-forwarded- headers, because apps often need them to make
  // decisions (such as about redirecting to SSL or a canonical host),
  // and proxies often do this for you in the real world.
  xfwd: true
});

// Hanle Error
proxy.on('error',function(err,req,res){
  console.error("Proxy Error: ",err);
  res.writeHead(500);
  res.write("Upstream Proxy Error");
  res.end();
});

// Main HTTP Server
http.createServer(function (req, res) {

  var target = addresses.shift();

  proxy.web(req, res, {target: target});

  addresses.push(target);

}).listen(port, function() {
  process.send({http: this.address().port});
});

if (sslCert && sslKey) {
  https.createServer({
      key: fs.readFileSync(sslKey),
      cert: fs.readFileSync(sslCert)
    },
    function (req, res) {

    var target = addresses.shift();

    proxy.web(req, res, {target: target});

    addresses.push(target);

  }).listen(sslPort, function() {
    process.send({https: this.address().port});
  });
}
