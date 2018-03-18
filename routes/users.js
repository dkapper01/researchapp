var express = require('express');
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require('passport-local');
var user_controller = require('../controllers/userController');


router.get('/users', user_controller.user_list);

module.exports = router;