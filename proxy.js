var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs').promises,
    request = require('request'),
    url = require('url'),
    modifyResponse = require('node-http-proxy-json');


var proxy = httpProxy.createProxyServer({});

var parseCookies = function(request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  console.log(req.headers.referer);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  const regex = RegExp('(index\.html|tokenlib\.js)');
  if(regex.test(req['url'])){
    fs.readFile(__dirname + req.url)
      .then(contents => {
          res.writeHead(200);
          res.end(contents);
      })
      .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
  }
  else if(url.parse(req.url,true).pathname == '/'){
    console.log(parseCookies(req));
    if(parseCookies(req)["jweToken"]){ //if session token is set user has already logged in
      proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
    }else{ //session token is not set so serve the login screen
      fs.readFile(__dirname + "/index.html")
        .then(contents => {
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
              res.writeHead(500);
              res.end(err);
              return;
          });
    }
  }
  //handle the login flow here
  else if(url.parse(req.url,true).pathname == '/login'){
    let token = [];
    req.on('data', (chunk) => {
      token.push(chunk);
    }).on('end', () => {
      token = Buffer.concat(token).toString();
      // at this point, `body` has the entire request body stored in it as a string
      //console.log(JSON.parse(token)["token"]);
      request
        .get('http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/api/v1/csrftoken/login',function(error,response,body){
          const options = {
            url: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/api/v1/login',
            headers: {
              'X-CSRF-TOKEN': JSON.parse(body)["token"]
            },
            body: {
              'token': JSON.parse(token)["token"]
            },
            json: true
          }
          console.log(options);
          request.post(options).pipe(res);
        })
    });
  }else if(url.parse(req.url,true).pathname == '/reload'){
    fs.readFile(__dirname + "/reload.html")
      .then(contents => {
          res.writeHead(200);
          res.end(contents);
      })
      .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
  }else if(url.parse(req.url,true).pathname == '/api/v1/login/status'){
    if(parseCookies(req)["jweToken"]){ //if session token is set user has already logged in
      proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
    }else{ //session token is not set so serve the login screen
      fs.readFile(__dirname + "/reload.html")
        .then(contents => {
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
              res.writeHead(500);
              res.end(err);
              return;
          });
    }
  }
  else{ //proxy all other requests to upstream dashboard
    proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
  }
});

console.log("listening on port 8000")
server.listen(8000);
//use this to redirect to login screen if /status returns tokenPresent : false
proxy.on('proxyRes',function(proxyRes, req, res, options){
  if(req['url'] == '/api/v1/login/status' && req['method'] == 'GET'){
    modifyResponse(res, proxyRes, function (body) {
        if (body && !body.tokenPresent) {
          console.log(body);
          //res.writeHead(302, { 'Location': '/index.html', 'Cache-Control': 'no-cache'});
          //res.writeHead(200, { 'Cache-Control': 'no-cache'});
          return body;
        }else{
          console.log(body);
          return body;
        }
    });
  }
});

//
// Listen for the `close` event on `proxy`.
//
proxy.on('close', function (res, socket, head) {
  // view disconnected websocket connections
  console.log('Client disconnected');
});
//var proxy = httpProxy.createProxyServer({target:'http://localhost:8001'}).listen(8000);
//proxy.on('proxyReq', function(proxyReq, req, res, options) {
//  bearer_token = get_bearer_token();
//  console.log(bearer_token);
//  proxyReq.setHeader('Authorization', bearer_token);
//});
