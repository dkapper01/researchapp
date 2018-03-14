var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

var auth_controller = require("../controllers/authController.js");

// GET home page.
router.get('/', function(req, res) {
  res.redirect('/login');
});


// restrict index for logged in user only
router.get('/', auth_controller.home);

// route to register page
router.get('/register', auth_controller.register_get);

// route for register action
router.post('/register', auth_controller.register_post);

// route to login page
router.get('/login', auth_controller.login_get);

// route for login action
router.post('/login', auth_controller.login_post);

// route for logout action
router.get('/logout', auth_controller.logout);

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}



module.exports = router;

