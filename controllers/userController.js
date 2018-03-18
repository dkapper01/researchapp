var mongoose = require("mongoose");
var Company = require('../models/company');
var Titan = require('../models/titan');
var Firm = require('../models/firm');
var User = require('../models/user');
var async = require('async');
var passport = require("passport");

// Restrict access to root page
exports.home = function(req, res) {
    res.render('index', { user : req.user });
};

// Go to registration page
exports.register_get = function(req, res) {
    res.render('register');
};

// Post registration
exports.register_post = function(req, res) {
    User.register(new User({ username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/data');
        });
    });
};

// Go to login page
exports.login_get = function(req, res) {
    res.render('login');
};

// Post login
exports.login_post = function(req, res) {
    passport.authenticate('local')(req, res, function () {
        res.redirect('/data');
    });
};

// logout
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/login');
};

exports.user_list = function (req, res) {
    res.send('Hey its working');
    // User.find()
    //     .sort([['username', 'descending']])
    //     .exec(function (err, list_users) {
    //         if(err) { return next(err); }
    //     res.render('user_list', { title: 'User List', list_users: list_users });
    //     });
};



function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}