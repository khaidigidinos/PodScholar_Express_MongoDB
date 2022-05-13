var express = require('express');
var router = express.Router();

const notAuthenticatedObj = {
  isAuthenticated: false
}

router.get('/:name', function(req, res, next) {

  if(!req.user) res.render(`pages/${req.params.name}`, notAuthenticatedObj)
  else res.render(`pages/${req.params.name}`, { user: req.user, isAuthenticated: true })
}) 

module.exports = router;