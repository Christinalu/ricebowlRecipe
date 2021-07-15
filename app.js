const fs = require('fs');
const path = require('path');
const https = require('https'); // for serving SSL/HTTPS (placeholder until replaced by nginx)
const helmet = require('helmet'); // for application security
const logger = require('morgan');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const passport = require('passport'); // for authentication
const { Strategy } = require('passport-google-oauth20'); // for authentication
const cookieSession = require('cookie-session');

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const PORT = 9000 || process.env.PORT;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

// Authorization secrets and callback URL to be used to create a new passport Strategy
const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log('Google Profile', profile);
  done(null, profile);
};

// Create a new passport Strategy using the AUTH_OPTIONS
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// Save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Read the session from the cookie
passport.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();

app.use(helmet());
app.use(
  cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());

// This function checks that the user is Authenticated
// If the user is not authenticated, an error page will be rendered.
// Otherwise, it will call next() so that the user can access the restricted API route.
const checkAuth = (req, res, next) => {
  console.log('Current user is:', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must be logged in!',
    });
  }
  next();
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth route to the Google oauth server
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email'],
  })
);

// The callback route for Google oauth to redirect to
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/error',
    successRedirect: '/',
    session: true,
  }),
  (req, res) => {
    console.log('Google success');
  }
);

// Logout route
// Removes req.user and clears any logged in session
app.get('/auth/logout', (req, res) => {
  req.logout();
  return res.redirect('/');
});

// Display error when log in fails
app.get('/error', (req, res) => {
  res.send('Failed to log in');
});

app.get('/testauth', checkAuth, (req, res) => {
  res.send('You have succesfully found the secret auth page!');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// ejs view engine set up
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('index');
});

// Self-signed OpenSSL digitial certification for SSL/TLS/https connections
// Note that this will be replaced with app.listen(), and SSL/TLS will be handled by Nginx
// once the application is fully deployed on the Google Cloud VM
https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`[Server]: Listening on port: ${PORT}`);
  });
