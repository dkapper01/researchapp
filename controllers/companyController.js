var Company = require('../models/company');
var Titan = require('../models/titan');
var Firm = require('../models/firm');
var async = require('async');

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
        res.render('index', { title: 'Researcher App Home', error: err, data: results });
    });
};


// Display list of all companys.
exports.company_list = function(req, res, next) {

    Company.find()
        .sort([['company_name', 'descending']])
        .exec(function (err, list_companys) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('company_list', { title: 'Company List', list_companys:  list_companys});
        });

};

// Display detail page for a specific company.
exports.company_detail = function(req, res, next) {

    async.parallel({
        company: function(callback) {

            Company.findById(req.params.id)
              .exec(callback);
        },
        firm_company: function(callback) {
            Firm.find({ 'firm': req.params.id })
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
        res.render('company_detail', { title: 'Company Detail', company:  results.company, firm_company: results.firm_company } );
    });

};

// Display company add form on GET.
exports.company_add_get = function(req, res, next) {
        // res.render('company_form', { title: 'Add Company' });

    Firm.find({},'firm_name')
        .exec(function (err, firms) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('company_form', {title: 'Add Company', firm_list:firms } );
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
            investment_date: req.body.investment_date,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url

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
            Company.findById(req.params.id).populate('titan').populate('firm').exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            res.redirect('/data/companys');
        }
        // Successful, so render.
        res.render('company_delete', { title: 'Delete Company', company: results.company } );
    });

};

// Handle company delete on POST.
exports.company_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id).populate('titan').populate('firm').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success

        else {
            // Company has no CompanyInstance objects. Delete object and redirect to the list of companys.
            Company.findByIdAndRemove(req.body.id, function deleteCompany(err) {
                if (err) { return next(err); }
                // Success - got to companys list.
                res.redirect('/data/companys');
            });

        }
    });

};

// Display company update form on GET.
exports.company_update_get = function(req, res, next) {

    Company.findById(req.params.id, function(err, company) {
        if (err) { return next(err); }
        if (company==null) { // No results.
            var err = new Error('Company not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('company_form', { title: 'Update Company', company: company });
    });

};


// Handle company update on POST.
exports.company_update_post = function (req, res, next) {

    var company = new Company(
        {
            company_name: req.body.company_name,
            investment_date: req.body.investment_date,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url,
            firm: req.body.firm,
            _id: req.params.id // This is required, or a new ID will be assigned!
        });

    Company.findByIdAndUpdate(req.params.id, company, {}, function (err,thecompany) {
        if (err) { return next(err); }
        // Successful - redirect to firm detail page.
        res.redirect(thecompany.url);
    });

};

