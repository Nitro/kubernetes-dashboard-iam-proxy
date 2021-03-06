var express = require('express')
var router = express.Router()
var request = require('request')

/* GET login page. */
router.get('/', function (req, res, next) {
  const upstreamHost = global.appConfig.upstreamDashboard.url
  request(upstreamHost, function (error, response, body) {
    if (error != null || response.statusCode !== 200) {
      console.log('unable to contact upstream kubernetes dashboard')
      res.status(503).send()
    } else {
      try {
        res.send(200, JSON.stringify({ status: 'ok' }))
      } catch (e) {
        res.status(503).send()
        console.error('error:', e)
      }
    }
  })
})

module.exports = router
