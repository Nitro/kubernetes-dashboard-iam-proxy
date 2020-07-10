var express = require('express')
var router = express.Router()
var request = require('request')

/* POST login. */

router.post('/', function(req, res, next) {
  k8sToken = req.body["token"];
  upstreamHost = global.appConfig.upstreamDashboard.url;

  request
    .get(upstreamHost + '/api/v1/csrftoken/login',function(error,response,body){
      const options = {
        url: upstreamHost + '/api/v1/login',
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
