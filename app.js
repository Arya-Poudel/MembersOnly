const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
const session = require("cookie-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const createError = require('http-errors');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config()

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "pug");

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


const router = require('./routes/index');
app.use('/', router);

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

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, function() {
  console.log("Server started.......");
})