var Titan = require('../models/titan');
var Firm = require('../models/firm');
var User = require('../models/user');
var Company = require('../models/company');
var async = require('async');


const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Titans.
exports.titan_list = function (req, res, next) {

    Titan.find()
        .populate('company')
        .populate('user', 'username')
        .sort([['_id', -1]])
        .exec(function (err, list_titans) {
            if (err) { return next(err); }
            // Successful, so render.
            // console.log(titan.user._id.toString())
            res.render('titan_list', { title: 'Titan List', titan_lists: list_titans });
        });

    // async.parallel({
    //     users: function(callback) {
    //         User.find(callback);
    //     },
    //     titan_lists: function(callback) {
    //         Titan.find(callback);
    //     },
    // }, function(err, results) {
    //     if (err) { return next(err); }
    //     res.render('titan_list', { title: 'Titan List',users:results.users, titan_lists:results.titan_lists });
    // });
};

// Display detail page for a specific Titan.
exports.titan_detail = function (req, res, next) {

    async.parallel({

        titan: function (callback) {
            Titan.findById(req.params.id)
                .populate('user', 'username')
                .populate({
                    path: 'company',
                    populate: { path: 'firm' }
                }).exec(callback);
        },

        titan_user: function (callback) {
            User.findOne()
                .populate('user', 'username')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.titan == null) { // No results.
            var err = new Error('Titan not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('titan_detail', { title: 'Titan Detail',  titan: results.titan, titan_user: results.titan_user});
    });

    // User.findOne({username:'someusername'}).exec(function(err,user){
    //     console.log(user) //this gives full object with something like {_id:234234dfdfg,username:'someusername'}



    };

// Display Titan add form on GET.
exports.titan_add_get = function (req, res, next) {
    var the_company_id = req.params.company_id;

    // Get all users and genres, which we can use for adding to our titan.
    async.parallel({
        users: function(callback) {
            User.find(callback);
        },
        companys: function(callback) {
            Company.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('titan_form', { title: 'Add Titan',users:results.users, companys:results.companys, the_company_id: the_company_id });
    });
};

// Handle Titan add on POST.
exports.titan_add_post = [


    // Sanitize (trim and escape) the name field.
    // sanitizeBody('titan_name').trim().escape(),
    sanitizeBody('start_date').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {


    // Add a titan object with escaped and trimmed data.
    var titan = new Titan(
        {
            company: req.params.company_id,
            titan_name: req.body.titan_name,
            start_date: req.body.start_date,
            bloomberg_url: req.body.bloomberg_url,
            linkedin_url: req.body.linkedin_url,
            freelancer: req.body.freelancer,
            profile_status: req.body.profile_status,
            user: req.body.user,
            publisher: req.user.username
        });


// Data from form is valid.
// Check if Titan with same name already exists.
Titan.findOne({'titan_name': req.body.titan_name})
    .exec(function (err, found_titan) {
        if (err) {
            return next(err);
        }

        if (found_titan) {
            // Titan exists, redirect to its detail page.
            res.redirect(found_titan.url);
        }
        else {
            titan.save(function (err) {
                if (err) {
                    return next(err);
                }
                // Titan saved. Redirect to titan detail page.
                res.redirect(titan.url);
            });

        }

    });
}
];



// Display Titan delete form on GET.
exports.titan_delete_get = function (req, res, next) {

    async.parallel({
        titan: function (callback) {
            Titan.findById(req.params.id).exec(callback)
        },
        titans_companys: function (callback) {
            Company.find({ 'titan': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.titan == null) { // No results.
            res.redirect('/data/titans');
        }
        // Successful, so render.
        res.render('titan_delete', { title: 'Delete Titan', titan: results.titan, titan_companys: results.titans_companys });
    });

};

// Handle Titan delete on POST.
exports.titan_delete_post = function (req, res, next) {

    async.parallel({
        titan: function (callback) {
            Titan.findById(req.body.titanid).exec(callback)
        },
        titans_companys: function (callback) {
            Company.find({ 'titan': req.body.titanid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.titans_companys.length > 0) {
            // Titan has companys. Render in same way as for GET route.
            res.render('titan_delete', { title: 'Delete Titan', titan: results.titan, titan_companys: results.titans_companys });
            return;
        }
        else {
            // Titan has no companys. Delete object and redirect to the list of titans.
            Titan.findByIdAndRemove(req.body.titanid, function deleteTitan(err) {
                if (err) { return next(err); }
                // Success - go to titan list.
                res.redirect('/data/titans')
            })

        }
    });

};

// Display Titan update form on GET.
exports.titan_update_get = function (req, res, next) {

    async.parallel({
        titan: function(callback) {
            Titan.findById(req.params.id).populate('user').exec(callback)
        },
        company: function(callback) {
            Company.find(callback)
        },
        users: function(callback) {
            User.find(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            var err = new Error('Titan not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('titan_form', { title: 'Update  Titan', company_list : results.company, titan:results.titan, users:results.users  });
    });

};


exports.titan_update_post = [

    // Validate fields.

    // Sanitize fields.
    sanitizeBody('start_date').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

    // Extract the validation errors from a request.

// Create Titan object with escaped and trimmed data (and the old id!)
    var titan = new Titan(
        {
            company: req.body.firm,
            titan_name: req.body.titan_name,
            start_date: req.body.start_date,
            bloomberg_url: req.body.bloomberg_url,
            linkedin_url: req.body.linkedin_url,
            freelancer: req.body.freelancer,
            profile_status: req.body.profile_status,
            user: req.body.user,
            publisher: req.user.username,
            _id: req.params.id
        }
    );



// Data from form is valid. Update the record.
Titan.findByIdAndUpdate(req.params.id, titan, {}, function (err, thetitan) {
    if (err) { return next(err); }
    // Successful - redirect to genre detail page.
    res.redirect(thetitan.url);
});

}
];