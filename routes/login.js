var express = require('express')
var router = express.Router()
var request = require('request')

/* POST login. */

router.post('/', function(req, res, next) {
  k8sToken = req.body["token"];
  proxyHost = global.appConfig.kubeProxy.host;
  proxyPort = global.appConfig.kubeProxy.port;

  request
    .get('http://'+proxyHost+':'+proxyPort+'/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/api/v1/csrftoken/login',function(error,response,body){
      const options = {
        url: 'http://'+proxyHost+':'+proxyPort+'/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/api/v1/login',
        headers: {
          'X-CSRF-TOKEN': JSON.parse(body).token
        },
        body: {
          token: k8sToken
        },
        json: true
      }
      console.log(options)
      request.post(options).pipe(res)
    })
})

module.exports = router
