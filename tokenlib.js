ALGORITHM = 'AWS4-HMAC-SHA256';
REGION = 'us-east-1';
HOST = 'sts.amazonaws.com'
SERVICE = 'sts';
STS_TOKEN_EXPIRES_IN = 60;
SIGNED_HEADERS = 'host;x-k8s-aws-id';
CANONICAL_URI = '/';
METHOD = 'GET';
ENDPOINT = 'https://sts.amazonaws.com/'
REQUEST_PARAMETERS = 'Action=GetCallerIdentity&Version=2011-06-15'
AMZDATE = moment.utc().format("YYYYMMDD[T]HHmmss[Z]");
//AMZDATE = "20200625T132434Z";
DATESTAMP = moment.utc().format("YYYYMMDD");
//DATESTAMP = "20200624";

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

get_canonical_query_string = function(accesskey){
  return REQUEST_PARAMETERS + '&'
       + 'X-Amz-Algorithm=' + ALGORITHM + '&'
       + 'X-Amz-Credential=' + encodeURIComponent(build_credentials(accesskey)) + '&'
       + 'X-Amz-Date=' + AMZDATE + '&'
       + 'X-Amz-Expires=' + STS_TOKEN_EXPIRES_IN + '&'
       + 'X-Amz-SignedHeaders=' + encodeURIComponent(SIGNED_HEADERS);
}

get_canonical_request = function(accesskey){
  canonical_querystring = get_canonical_query_string(accesskey);
  canonical_headers = 'host:' + HOST + '\n' + 'x-k8s-aws-id:' + 'nitro-eks-dev' + '\n';
  var payload_hash = CryptoJS.SHA256('');
  return METHOD + '\n' + CANONICAL_URI + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + SIGNED_HEADERS + '\n' + payload_hash;
}

get_string_to_sign = function(accesskey){
  var credential_scope = DATESTAMP + '/' + REGION + '/' + SERVICE + '/' + 'aws4_request';
  var canonical_request = get_canonical_request(accesskey);
  return ALGORITHM + '\n' +  AMZDATE + '\n' +  credential_scope + '\n' +  CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(canonical_request));
}

build_signature = function(accesskey,secret_key){
  var signing_key = get_signature_key(secret_key);
  var string_to_sign = get_string_to_sign(accesskey);
  return CryptoJS.HmacSHA256(CryptoJS.enc.Utf8.parse(string_to_sign),signing_key);
}

get_bearer_token = function(accesskey,secretkey){
  var bearer_token = build_query_parameters(accesskey,secretkey);
  base64_url = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(bearer_token));
  return 'k8s-aws-v1.' + base64_url.replace(/=*/g,'').replace("/","_").replace("+","-");
}

build_query_parameters = function(accesskey,secretkey){
  return ENDPOINT + '?'
       + REQUEST_PARAMETERS + '&'
       + 'X-Amz-Algorithm=' + ALGORITHM + '&'
       + 'X-Amz-Credential=' + encodeURIComponent(build_credentials(accesskey)) + '&'
       + 'X-Amz-Date=' + AMZDATE + '&'
       + 'X-Amz-Expires=' + STS_TOKEN_EXPIRES_IN + '&'
       + 'X-Amz-SignedHeaders=' + encodeURIComponent(SIGNED_HEADERS) + '&'
       + 'X-Amz-Signature=' + build_signature(accesskey,secretkey);
}
