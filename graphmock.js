var http = require('http');
var https = require('https');
var qs = require('querystring');
var request = require('request');
var url = require('url');


function server (req, res) {
  var store = function (err, data) {
    if (err) return respond(err);
    storeData(req.url, data, query);
  };

  var query = function (err, data) {
    if (err) return respond(err);
    queryData(req.url, respond);
  };

  var respond = function (err, data) {
    var status = err ? 500 : 200;
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(err || data));
  };

  // Read in the request body
  req.setEncoding('utf8');
  req.on('data', function (chunk) { req.body = (req.body || '') + chunk; });
  req.on('end', function () {
    if (process.argv.toString().indexOf('--passthrough') > -1) {
      queryFacebook(req, store);
    }
    else {
      query();
    }
  });
}


function queryFacebook (req, callback) {
  request({
      uri: 'https://' + 'graph.facebook.com' + req.url,
      method: req.method,
      body: req.body
  }, function (err, response, body) {
    try {
      body = JSON.parse(body);
    }
    catch (e) { err = e; }

    return callback(err, body);
  });
}


var store = {};

function storeData (path, data, callback) {
  console.log('Pat saves data to the store here!');
  store[path] = data;
  return callback(null, data);
}


function queryData (path, callback) {
  console.log('Pat queries the store here!');
  return callback(null, store[path]);
}


var port = process.argv[2] || 8080;
http.createServer(server).listen(port, '127.0.0.1');
console.log('GraphMock running at http://127.0.0.1:' + port + '/');
