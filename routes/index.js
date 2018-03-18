var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

var user_controller = require("../controllers/userController.js");

// GET home page.
router.get('/', function(req, res) {
  res.redirect('/login');
});


// restrict index for logged in user only
router.get('/', user_controller.home);

// route to register page
router.get('/register', user_controller.register_get);

// route for register action
router.post('/register', user_controller.register_post);

// route to login page
router.get('/login', user_controller.login_get);

// route for login action
router.post('/login', user_controller.login_post);

// route for logout action
router.get('/logout', user_controller.logout);


module.exports = router;

