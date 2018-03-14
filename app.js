var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require("express-session");
var mongoose = require('mongoose');
var User = require('./models/user');



var index = require('./routes/index');
var users = require('./routes/users');
var data = require('./routes/data'); // Import routes for "data" area of site
var compression = require('compression');
var helmet = require('helmet');

// Add the Express application object
var app = express();

app.use(helmet());

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb://daniel:titanhouse@ds261488-a0.mlab.com:61488,ds261488-a1.mlab.com:61488/researchapp?replicaSet=rs-ds261488'

// var dev_db_url = 'mongodb://daniel:titanhouse@ds153198.mlab.com:53198/researchapp'

var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));




// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
// app.use('/index', index);
app.use('/data', data); // Add data routes to middleware chain.

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// PASSSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = app;

