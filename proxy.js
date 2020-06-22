var http = require('http'),
    httpProxy = require('http-proxy'),
    moment = require('moment'),
    CryptoJS = require("crypto-js"),
    fs = require('fs').promises,
    request = require('request'),
    url = require('url');

ALGORITHM = 'AWS4-HMAC-SHA256';
REGION = 'eu-central-1';
HOST = 'sts.eu-central-1.amazonaws.com'
SERVICE = 'sts';
STS_TOKEN_EXPIRES_IN = 60;
SIGNED_HEADERS = 'host;x-k8s-aws-id';
CANONICAL_URI = '/';
METHOD = 'GET';
ENDPOINT = 'https://sts.eu-central-1.amazonaws.com/'
REQUEST_PARAMETERS = 'Action=GetCallerIdentity&Version=2011-06-15'
AMZDATE = moment.utc().format("YYYYMMDD[T]hhmmss[Z]");
DATESTAMP = moment.utc().format("YYYYMMDD");

//start of functions for generating the token
// this should be done client-side
sign = function(key, msg){
  return CryptoJS.HmacSHA256(msg, key);
}

get_signature_key = function(key){
  kDate = sign(('AWS4' + key), DATESTAMP);
  kRegion = sign(kDate, REGION);
  kService = sign(kRegion, SERVICE);
  kSigning = sign(kService, 'aws4_request');
  return kSigning;
}

build_credential_scope = function(){
  return DATESTAMP + '/' + REGION + '/' + SERVICE + '/' + 'aws4_request';
}

build_credentials = function(accesskey){
  return accesskey + '/' + build_credential_scope();
}

get_canonical_query_string = function(){
  return REQUEST_PARAMETERS + '&'
       + 'X-Amz-Algorithm=' + ALGORITHM + '&'
       + 'X-Amz-Credential=' + encodeURIComponent(build_credentials(REGION,SERVICE)) + '&'
       + 'X-Amz-Date=' + AMZDATE + '&'
       + 'X-Amz-Expires=' + STS_TOKEN_EXPIRES_IN + '&'
       + 'X-Amz-SignedHeaders=' + encodeURIComponent(SIGNED_HEADERS);
}

get_canonical_request = function(){
  canonical_querystring = get_canonical_query_string();
  canonical_headers = 'host:' + HOST + '\n' + 'x-k8s-aws-id:' + 'nitro-eks-dev' + '\n';
  var payload_hash = CryptoJS.SHA256('');
  return METHOD + '\n' + CANONICAL_URI + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + SIGNED_HEADERS + '\n' + payload_hash;
}

get_string_to_sign = function(){
  var credential_scope = DATESTAMP + '/' + REGION + '/' + SERVICE + '/' + 'aws4_request';
  var canonical_request = get_canonical_request();
  return ALGORITHM + '\n' +  AMZDATE + '\n' +  credential_scope + '\n' +  CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(canonical_request));
}

build_signature = function(secret_key){
  var signing_key = get_signature_key(secret_key);
  var string_to_sign = get_string_to_sign();
  return CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(string_to_sign),signing_key);
}

get_bearer_token = function(accesskey,secretkey){
  var bearer_token = build_query_parameters(accesskey,secretkey);
  base64_url = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(bearer_token));
  return 'k8s-aws-v1.' + base64_url.replace(/=*/g,'');
}

build_query_parameters = function(accesskey,secretkey){
  return ENDPOINT + '?'
       + REQUEST_PARAMETERS + '&'
       + 'X-Amz-Algorithm=' + ALGORITHM + '&'
       + 'X-Amz-Credential=' + encodeURIComponent(build_credentials(accesskey)) + '&'
       + 'X-Amz-Date=' + AMZDATE + '&'
       + 'X-Amz-Expires=' + STS_TOKEN_EXPIRES_IN + '&'
       + 'X-Amz-SignedHeaders=' + encodeURIComponent(SIGNED_HEADERS) + '&'
       + 'X-Amz-Signature=' + build_signature(secretkey);
}
//end of functions for generating the token
// this should be done client-side

// experimenting with the proxy-side
// Create a proxy server with custom application logic
var proxy = httpProxy.createProxyServer({});

// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  if(req['url'] == '/'){
    fs.readFile(__dirname + "/index.html")
      .then(contents => {
          res.setHeader("Content-Type", "text/html");
          res.writeHead(200);
          res.end(contents);
      })
      .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
  }
  if(url.parse(req.url,true).pathname == '/api/v1/login'){
    const queryObject = url.parse(req.url,true).query;
    bearer_token = get_bearer_token(queryObject['accesskey'],queryObject['secretkey']);
    console.log(bearer_token);
    req.body = {token: bearer_token};
    proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
  }
  if(req['url'] == '/api/v1/login/skippable' && req['method'] == 'GET'){
    proxy.web(req, res, { target: 'http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/' });
    bearer_token = get_bearer_token();
    console.log(bearer_token);
  }else{
    console.log("proxying to upstream");
    console.log(req['url']);
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
