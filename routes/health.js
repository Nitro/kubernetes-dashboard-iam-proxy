var express = require('express')
var router = express.Router()
var request = require('request')

/* GET login page. */
router.get('/', function (req, res, next) {
  upstreamHost = global.appConfig.upstreamDashboard.url;
  request(upstreamHost,function(error, response, body){
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode);
    if(error != null || response.statusCode != 200){
      res.status(503).send();
    }else{
      try {
		      res.send(200, JSON.stringify({ status: 'ok' }));
	    } catch (e) {
		      res.status(503).send();
	    }
    }
  });
})

module.exports = router
