var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const secret = '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
const jwt = require('jsonwebtoken');

var indexRouter = require('./web_routes/index');
var api = require('./routes/api')

var pagesRouter = require('./web_routes/pages');

var app = express();
app.disable('etag')

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/pages'), path.join(__dirname, 'views/categories')]);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

async function auth(req, res, next) {
  let token = req.headers['authorization']
  if(!token) {
    token = req.query.token
  }
  await jwt.verify(token, secret, (err, user) => {
    if(user) {
      req.user = user
      req.user.token = token
    }
    next()
  })
}

app.use('/', auth, indexRouter);
app.use('/pages', auth, pagesRouter);
app.use('/api', auth, api);

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
