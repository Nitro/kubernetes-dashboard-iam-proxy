var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');

// Config is global to the app
global.appConfig = require('./config/default.json');

var app = express();
const proxy = createProxyMiddleware({
  target: 'http://'+global.appConfig.kubeProxy.host+':'+global.appConfig.kubeProxy.port+'/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/',
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  logLevel: global.appConfig.logLevel,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/',indexRouter);
app.use('/login',loginRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',proxy);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
