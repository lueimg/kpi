var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    session = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    connection = require('./server/core/database.js'),
    path = require('path'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    mime = require('mime'),
    bcrypt = require('bcrypt'),
    responseUltis = require('./server/core/ResponseUtils'),
    configs = require('./server/core/config'),
    logger = require('morgan'),
    compression = require('compression'),
    port = configs.PORT;

// On Window it requires https://github.com/nodejs/node-gyp#installation
// Pass 123: $2a$10$qkBhcz1bTsPEsZFNAyAK..TSqjehm8piCfJMnoobbtFGNTIo4pSIq
// Set global function to avoid using console.log
app.use(logger("dev"));
app.use(compression());

global.printLog = function (msg) {
  'use strict';
  console.log(msg);
};

// Set global function to handle db queries and have a log
global.dbQuery = function () {
  var query = arguments[0],
      params = arguments[1],
      callback = arguments[2],
      startAt = new Date();

  connection.query(query, params, function () {
    printLog(startAt + ' - DBQ: ' + query);
    printLog(startAt + ' - DBQP: ' + params);
    printLog((new Date()) + ' - DBQR');
    callback.apply(this, arguments);
  });
};

// config file
require('./server/core/express-config.js')(app, express, bodyParser, multipart);

if (configs.authenticationActive) {
  //Authentication module
require('./server/core/authentication.js')(app, passport, LocalStrategy, cookieParser, session, connection, bcrypt);

}

// Show the main html in the app
app.get('/', function (req, res) {
  try {
    if (configs.authenticationActive && !req.user) return res.redirect('/login.html');

    res.sendFile(path.join(__dirname+'/public/_index.html'));
  } catch (err){
    responseUltis.sendInternalServerError(res, err);
  }
});

// Verify Session
app.use(function (req, res, next) {
  printLog('CALL: ' + req.url + '\tMETHOD: ' + req.method + '\tAT:' + new Date());

  if (req.path.indexOf('downloadPDF') >= 0) {
    next();
  } else if (req.user) {
    if (req.user.status == 2) {
      return res.redirect('/login.html?s=2');
    }
    next();
  } else {
    responseUltis.SessionHasExpired(res);
  }
});

// End points
app.use('/Api/Document', require('./server/features/document.js'));


app.use(function (request, response) {
  // Instead of 404 error response.end("404!");
  response.redirect('/');
});

app.listen(port, function () {
  console.log('Public server  running at port ' + port);
  console.log('http://localhost:' + port);
  console.log('\tAT:' + new Date());
});
