var Company = require('../models/company');
var Titan = require('../models/titan');
var Firm = require('../models/firm');
var User = require('../models/user');
var async = require('async');
var passport = require("passport");

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {

    async.parallel({
        company_count: function(callback) {
            Company.count(callback);
        },
        titan_count: function(callback) {
            Titan.count(callback);
        },
        firm_count: function(callback) {
            Firm.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Researcher App', error: err, data: results });
    });
};

// Display list of all companys.
exports.company_list = function(req, res, next) {

    Company.find()
        .sort([['company_name', 'descending']])
        .exec(function (err, list_companys) {
            if (err) { return next(err); }
            // Successful, so render.
            console.log('Company List Here');
            res.render('company_list', { title: 'Company List', list_companys:  list_companys});
        });
};

// Display detail page for a specific company.
exports.company_detail = function(req, res, next) {

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id)
                .populate('firm')
                .exec(callback);
        },
        company_titan: function(callback) {
            Titan.find({ 'company': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            var err = new Error('Company not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('company_detail', { title: 'Company Detail', firm: results.firm, company:  results.company, company_titan: results.company_titan } );
    });
};

// Display company add form on GET.
exports.company_add_get = function(req, res, next) {
        // res.render('company_form', { title: 'Add Company' });
    //
    // Firm.find({},'firm_name')
    //     .exec(function (err, firms) {
    //         if (err) { return next(err); }
    //         // Successful, so render.
    //         res.render('company_form', {title: 'Add Company', firm_list:firms } );
    //     });

    Firm.find({},'firm_name')
        .exec(function (err, firms) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('company_form', {title: 'Add Company', forms:firms } );
        });

};

// Handle company add on POST.
exports.company_add_post = [

    // Sanitize (trim and escape) the name field.
    sanitizeBody('company_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {


    var company = new Company(
        {
            firm: req.body.firm,
            company_name: req.body.company_name,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url,
            investment_date: req.body.investment_date,
            status: req.body.status
        });


// Data from form is valid.
// Check if Firm with same name already exists.
Company.findOne({'company_name': req.body.company_name})
    .exec(function (err, found_company) {
        if (err) {
            return next(err);
        }

        if (found_company) {
            // Firm exists, redirect to its detail page.
            res.redirect(found_company.url);
        }
        else {
            company.save(function (err) {
                if (err) {
                    return next(err);
                }
                // Firm saved. Redirect to company detail page.
                res.redirect(company.url);
            });

        }

    });
}
];

// Display company delete form on GET.
exports.company_delete_get = function(req, res, next) {

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id)
                .populate('firm')
                .exec(callback);
        },
        company_titan: function(callback) {
            Titan.find({ 'company': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            var err = new Error('Company not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('company_delete', { title: 'Company Detail', firm: results.firm, company:  results.company, company_titan: results.company_titan } );
    });


};

// Handle company delete on POST.
exports.company_delete_post = function(req, res, next) {

    async.parallel({
        company: function (callback) {
            Company.findById(req.body.companyid).exec(callback)
        },
        company_titan: function (callback) {
            Titan.find({ 'company': req.body.companyid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.company_titan.length > 0) {
            // Company has books. Render in same way as for GET route.
            res.render('company_delete', { title: 'Delete Company', company: results.company, company_titan: results.company_titan });
            return;
        }
        else {
            // Company has no books. Delete object and redirect to the list of companys.
            Company.findByIdAndRemove(req.body.companyid, function deleteCompany(err) {
                if (err) { return next(err); }
                // Success - go to company list.
                res.redirect('/data/companys')
            })

        }
    });

};

// Display company update form on GET.
exports.company_update_get = function(req, res, next) {

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id).populate('firm').exec(callback)
        },
        firm: function(callback) {
            Firm.find(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            var err = new Error('Company not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('company_form', { title: 'Update  Company', firm_list : results.firm, company:results.company });
    });

};


// Handle company update on POST.
exports.company_update_post = function (req, res, next) {

    var company = new Company(
        {
            company_name: req.body.company_name,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url,
            firm: req.body.firm,
            status: req.body.status,
            investment_date: req.body.investment_date,
            _id: req.params.id // This is required, or a new ID will be assigned!
        });

        Company.findByIdAndUpdate(req.params.id, company, {}, function (err,thecompany) {
            if (err) { return next(err); }
            // Successful - redirect to firm detail page.
            res.redirect(thecompany.url);
        });

};



exports.company_get_new_titan = function (req, res, next) {
    res.render('titan_form', { title: 'New Titan' });

};

exports.company_post_new_titan = function (req, res, next) {

    var TitanSchema = new Schema(
        {
            titan_name: {type: String, required: true, max: 100},
            start_date: { type: Date },
            bloomberg_url: {type: String},
            linkedin_url: {type: String},
            // company: { type: Schema.ObjectId, ref: 'Company', required: true }
        }
    );

    titan.save(function (err) {
        if (err) { return next(err); }
        // successful - redirect.
        res.redirect(titan.url);
    });

};

