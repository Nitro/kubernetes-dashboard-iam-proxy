// Config is global to the app
global.appConfig = require('./config/default');

var createError = require('http-errors')
var express = require('express')
var path = require('path')
var logger = require('morgan')
var cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
var indexRouter = require('./routes/index')
var loginRouter = require('./routes/login')
var healthRouter = require('./routes/health')

var app = express()

const proxy = createProxyMiddleware({
  target: global.appConfig.upstreamDashboard.url,
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  logLevel: global.appConfig.logLevel,
  onProxyReq: function(proxyReq, req, res, options) {
      if (req.body) {
          let bodyData = JSON.stringify(req.body);
          // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
          proxyReq.setHeader('Content-Type','application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          // stream the content
          proxyReq.write(bodyData);
      }
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html');

app.use(logger('short'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', indexRouter)
app.use('/login', loginRouter)
app.use('/health', healthRouter)
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
