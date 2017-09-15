/*
Mostly created by new express project
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var hbs = require('express-handlebars');
const debug = require('debug')('app');

//Includes hbs engine and custom helpers and partials
var hbs = require('./handle.js');
debug('booting');

var index = require('./routes/index');

var app = express();


//Sets the view engine
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//No favicon in /public -- Not sure of use case
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//Sets http response to read as a json
app.use(bodyParser.json({type:'application/json'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Sets static file directory
app.use(express.static(path.join(__dirname, 'public')));
//Includes index as the main router
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	debug('in 404 error handler');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
	debug('in error handler');
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err.message);
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
