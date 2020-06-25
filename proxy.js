var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs').promises,
    request = require('request'),
    url = require('url');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
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
  //handle the login flow here
  if(url.parse(req.url,true).pathname == '/login'){
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
              'token': '<add your token here>'},
            json: true
          }
          console.log(options);
          request.post(options).pipe(res);
        })
    });
  }else{ //proxy all other requests to upstream dashboard
    console.log("proxying to upstream");
    proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
  }
});

console.log("listening on port 8000")
server.listen(8000);
proxy.on('proxyRes',function(proxyRes, req, res, options){
  if(req['url'] == '/api/v1/login/skippable' && req['method'] == 'GET'){
    let body = Buffer.from('')
    proxyRes.on('data', function(dataBuffer) {
      body = Buffer.concat([body, dataBuffer])
      var data = dataBuffer.toString();
      console.log('This is the data from target server : ' + data);
    });

    proxyRes.on('end', () => {
    console.log("TCL: end", body.toString('utf8'))
    })
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
