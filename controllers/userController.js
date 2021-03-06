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
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
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

exports.user_list = function (req, res, next) {

    User.find({}, function(err, list_users) {
        if(err) { return next(err) }
        res.render('user_list', { list_users: list_users })
    });
};

exports.user_detail = function (req, res, next) {

    // User.findById(req.params.id, function (err, user) {
    //     if(err) { return next(err) }
    //     res.render('user_detail', { user: user })
    // });

    async.parallel({
        user: function (callback) {
            User.findById(req.params.id)
                .populate('titan')
                .exec(callback)
        },
        users_titans: function (callback) {
            Titan.find({ 'user': req.params.id })
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.user == null) { // No results.
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('user_detail', { title: 'User Detail', user: results.user, user_titans: results.users_titans });
    });

};



function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}