var express = require('express')
var router = express.Router()
var parseCookies = function (request) {
  var list = {}
  var rc = request.headers.cookie

  rc && rc.split(';').forEach(function (cookie) {
    var parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })

  return list
}

/* GET login page. */
router.get('/', function (req, res, next) {
  if (parseCookies(req).jweToken) { // if session token is set user has already logged in
    res.render('index.html',{ proxyURL : global.appConfig.proxy.url, proxyPort : global.appConfig.proxy.port })
  } else { // session token is not set so serve the login screen
    res.render('index.html',{ proxyURL : global.appConfig.proxy.url, proxyPort : global.appConfig.proxy.port })
  }
})

module.exports = router
