const appConfig = require('../../config/default')

const TokenLib = {
  moment : require('moment'),
  cryptojs : require('crypto-js'),
  ALGORITHM : 'AWS4-HMAC-SHA256',
  REGION : 'us-east-1',
  HOST : 'sts.amazonaws.com',
  SERVICE : 'sts',
  STS_TOKEN_EXPIRES_IN : 60,
  SIGNED_HEADERS : 'host;x-k8s-aws-id',
  CANONICAL_URI : '/',
  METHOD : 'GET',
  ENDPOINT : 'https://sts.amazonaws.com/',
  REQUEST_PARAMETERS : 'Action=GetCallerIdentity&Version=2011-06-15',
  AMZDATE : '',
  DATESTAMP : '',
  sign : (key, msg) => {
    return TokenLib.cryptojs.HmacSHA256(msg, key);
  },
  get_string_to_sign : (accesskey, clusterName) => {
    var credential_scope = TokenLib.DATESTAMP + '/' + TokenLib.REGION + '/' + TokenLib.SERVICE + '/' + 'aws4_request';
    var canonical_request = TokenLib.get_canonical_request(accesskey, clusterName);
    return TokenLib.ALGORITHM + '\n' +  TokenLib.AMZDATE + '\n' +  credential_scope + '\n' +  TokenLib.cryptojs.SHA256(TokenLib.cryptojs.enc.Utf8.parse(canonical_request));
  },
  get_canonical_query_string : (accesskey) => {
    return TokenLib.REQUEST_PARAMETERS + '&'
         + 'X-Amz-Algorithm=' + TokenLib.ALGORITHM + '&'
         + 'X-Amz-Credential=' + encodeURIComponent(TokenLib.build_credentials(accesskey)) + '&'
         + 'X-Amz-Date=' + TokenLib.AMZDATE + '&'
         + 'X-Amz-Expires=' + TokenLib.STS_TOKEN_EXPIRES_IN + '&'
         + 'X-Amz-SignedHeaders=' + encodeURIComponent(TokenLib.SIGNED_HEADERS);
  },
  get_canonical_request : (accesskey,clusterName) => {
    canonical_querystring = TokenLib.get_canonical_query_string(accesskey);
    canonical_headers = 'host:' + TokenLib.HOST + '\n' + 'x-k8s-aws-id:' + clusterName + '\n';
    var payload_hash = TokenLib.cryptojs.SHA256('');
    return TokenLib.METHOD + '\n' + TokenLib.CANONICAL_URI + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + TokenLib.SIGNED_HEADERS + '\n' + payload_hash;
  },
  get_string_to_sign : (accesskey, clusterName) => {
    var credential_scope = TokenLib.DATESTAMP + '/' + TokenLib.REGION + '/' + TokenLib.SERVICE + '/' + 'aws4_request';
    var canonical_request = TokenLib.get_canonical_request(accesskey, clusterName);
    return TokenLib.ALGORITHM + '\n' +  TokenLib.AMZDATE + '\n' +  credential_scope + '\n' +  TokenLib.cryptojs.SHA256(TokenLib.cryptojs.enc.Utf8.parse(canonical_request));
  },
  get_signature_key : (key) => {
    kDate = TokenLib.sign(('AWS4' + key), TokenLib.DATESTAMP);
    kRegion = TokenLib.sign(kDate, TokenLib.REGION);
    kService = TokenLib.sign(kRegion, TokenLib.SERVICE);
    kSigning = TokenLib.sign(kService, 'aws4_request');
    return kSigning;
  },
  build_credential_scope : () => {
    return TokenLib.DATESTAMP + '/' + TokenLib.REGION + '/' + TokenLib.SERVICE + '/' + 'aws4_request';
  },
  build_credentials : (accesskey) => {
    return accesskey + '/' + TokenLib.build_credential_scope();
  },
  build_signature : (accesskey,secret_key, clusterName) => {
    var signing_key = TokenLib.get_signature_key(secret_key);
    var string_to_sign = TokenLib.get_string_to_sign(accesskey, clusterName);
    return TokenLib.cryptojs.HmacSHA256(TokenLib.cryptojs.enc.Utf8.parse(string_to_sign),signing_key);
  },
  build_query_parameters : (accesskey,secretkey, clusterName) => {
    return TokenLib.ENDPOINT + '?'
         + TokenLib.REQUEST_PARAMETERS + '&'
         + 'X-Amz-Algorithm=' + TokenLib.ALGORITHM + '&'
         + 'X-Amz-Credential=' + encodeURIComponent(TokenLib.build_credentials(accesskey)) + '&'
         + 'X-Amz-Date=' + TokenLib.AMZDATE + '&'
         + 'X-Amz-Expires=' + TokenLib.STS_TOKEN_EXPIRES_IN + '&'
         + 'X-Amz-SignedHeaders=' + encodeURIComponent(TokenLib.SIGNED_HEADERS) + '&'
         + 'X-Amz-Signature=' + TokenLib.build_signature(accesskey,secretkey, clusterName);
  },
  get_bearer_token : (accesskey,secretkey, clusterName) => {
    TokenLib.AMZDATE = TokenLib.moment.utc().format("YYYYMMDD[T]HHmmss[Z]");
    TokenLib.DATESTAMP = TokenLib.moment.utc().format("YYYYMMDD");
    var bearer_token = TokenLib.build_query_parameters(accesskey,secretkey, clusterName);
    base64_url = TokenLib.cryptojs.enc.Base64.stringify(TokenLib.cryptojs.enc.Utf8.parse(bearer_token));
    return 'k8s-aws-v1.' + base64_url.replace(/=*/g,'').replace("/","_").replace("+","-");
  }
};

window.addEventListener('load', function () {
  function sendData (accesskey, secretkey) {
    const XHR = new XMLHttpRequest()
    XHR.addEventListener('load', function (event) {
      document.cookie = 'jweToken=' + encodeURI(JSON.parse(event.target.responseText).jweToken)
      document.cookie = 'authMode=token'
      // window.location.replace("http://localhost:8000");
      location.reload()
    })
    XHR.addEventListener('error', function (event) {
      alert('Oops! Something went wrong.')
    })
    XHR.open('POST', window.proxyURL + ':' + window.proxyPort + '/login')
    XHR.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    console.log(window.clusterName)
    const token = TokenLib.get_bearer_token(accesskey, secretkey, window.clusterName)
    console.log(token)
    XHR.send(JSON.stringify({ token: token }))
  }
  function createRipple (e) {
    var circle = document.createElement('div');
    this.appendChild(circle);
    var d = Math.max(this.clientWidth, this.clientHeight);
    circle.style.width = circle.style.height = d + 'px';
    var rect = this.getBoundingClientRect();
    circle.style.left = e.clientX - rect.left -d/2 + 'px';
    circle.style.top = e.clientY - rect.top - d/2 + 'px';
    circle.classList.add('ripple');
    setTimeout(function(){
      circle.remove();
    },500);
    sendData(document.getElementById('accesskey').value, document.getElementById('secretkey').value)
  }
  const button = document.getElementById('button')
  button.addEventListener('click', createRipple)
})

module.exports = TokenLib;
