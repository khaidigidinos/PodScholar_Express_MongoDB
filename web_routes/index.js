var express = require('express');
var router = express.Router();

const NOT_LOGGED_IN_USER = { isAuthenticated: false }

router.get('/', function(req, res, next) {
  if(!req.user) res.render('index', NOT_LOGGED_IN_USER);
  else {
    res.render('index', { user: req.user, isAuthenticated: true })
  }
});

router.get('/auth', function(req, res, next) {
  if(req.user) res.render('index', { user: req.user, isAuthenticated: true })
  else {
    res.render('auth', NOT_LOGGED_IN_USER)
  }
})

router.get('/categories/scientific-discipline', function(req, res, next) {
  if(!req.user) res.render('categories/scientific-discipline', NOT_LOGGED_IN_USER)
  else {
    res.render('categories/scientific-discipline', { user: req.user, isAuthenticated: true })
  }
})

router.get('/categories', function(req, res, next) {
  if(!req.user) res.render('categories/index', NOT_LOGGED_IN_USER)
  else {
    res.render('categories/index', { user: req.user, isAuthenticated: true })
  }
})

router.get('/keywords/tag', function(req, res, next) {
  if(!req.user) res.render('keywords/tag', NOT_LOGGED_IN_USER)
  else {
    res.render('keywords/tag', { user: req.user, isAuthenticated: true })
  }
})

router.get('/keywords', function(req, res, next) {
  if(!req.user) res.render('keywords/index', NOT_LOGGED_IN_USER)
  else {
    res.render('keywords/index', { user: req.user, isAuthenticated: true })
  }
})

router.get('/podcasts/create', async function(req, res, next) {
  if(!req.user) {
    res.render('auth', NOT_LOGGED_IN_USER)
    return
  }
  let isAuthor = req.user.is_verified_author

  if(isAuthor === true) {
    res.render('podcasts/create', { user: req.user, isAuthenticated: true}) 
  }
  else { res.redirect('/authors/create?token=' + req.user.token) }
})

router.get('/authors/create', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('authors/create', { user: req.user, isAuthenticated: true })
  }
})

router.get('/account', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('account/index', { user: req.user, isAuthenticated: true })
  }
})

router.get('/account/settings', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('account/settings', { user: req.user, isAuthenticated: true })
  }
})

router.get('/account/details', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('account/details', { user: req.user, isAuthenticated: true })
  }
})

router.get('/podcasts/podcast-title', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('podcasts/podcast-title', { user: req.user, isAuthenticated: true })
  }
})

router.get('/podcasts/podcast-title/edit', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('podcasts/edit', { user: req.user, isAuthenticated: true })
  }
})

router.get('/users/first-name-last-name', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('users/first-name-last-name', { user: req.user, isAuthenticated: true })
  }
})

router.get('/users/first-name-last-name/podcasts/uploaded', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('users/authored', { user: req.user, isAuthenticated: true })
  }
})

router.get('/users/first-name-last-name/podcasts/liked', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('users/liked', { user: req.user, isAuthenticated: true })
  }
})

router.get('/users/first-name-last-name/podcasts/saved', function(req, res, next) {
  if(!req.user) res.redirect('/auth')
  else {
    res.render('users/saved', { user: req.user, isAuthenticated: true })
  }
})

module.exports = router;
