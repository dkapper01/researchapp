var Company = require('../models/company');
var Titan = require('../models/titan');
var Firm = require('../models/firm');
var CompanyInstance = require('../models/companyinstance');

const { body,validationResult } = require('express-validator/check');
// const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        company_count: function(callback) {
            Company.count(callback);
        },
        company_instance_count: function(callback) {
            CompanyInstance.count(callback);
        },
        company_instance_available_count: function(callback) {
            CompanyInstance.count({status:'Available'},callback);
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

  Company.find({}, 'company_name titan ')
    .populate('titan')
    .exec(function (err, list_companys) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('company_list', { title: 'Company List', company_list:  list_companys});
    });

};

// Display detail page for a specific company.
exports.company_detail = function(req, res, next) {

    async.parallel({
        company: function(callback) {

            Company.findById(req.params.id)
              .populate('titan')
              .populate('firm')
              .exec(callback);
        },
        company_instance: function(callback) {

          CompanyInstance.find({ 'company': req.params.id })
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
        res.render('company_detail', { title: 'Title', company:  results.company, company_instances: results.company_instance } );
    });

};

// Display company create form on GET.
exports.company_create_get = function(req, res, next) {

    // Get all titans and firms, which we can use for adding to our company.
    async.parallel({
        titans: function(callback) {
            Titan.find(callback);
        },
        firms: function(callback) {
            Firm.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('company_form', { title: 'Create Company',titans:results.titans, firms:results.firms });
    });

};

// Handle company create on POST.
exports.company_create_post = [
    // Convert the firm to an array.
    (req, res, next) => {
        if(!(req.body.firm instanceof Array)){
            if(typeof req.body.firm==='undefined')
            req.body.firm=[];
            else
            req.body.firm=new Array(req.body.firm);
        }
        next();
    },

    // Validate fields.
    body('company_name', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('titan', 'Titan must not be empty.').isLength({ min: 1 }).trim(),
    body('leadership_page_url', 'Bloomberg URL must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    // sanitizeBody('*').trim().escape(),
    // sanitizeBody('firm.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {


        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Company object with escaped and trimmed data.
        var company = new Company(
          { company_name: req.body.company_name,
            investment_date: req.body.investment_date,
            titan: req.body.titan,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url,
            firm: req.body.firm
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all titans and firms for form.
            async.parallel({
                titans: function(callback) {
                    Titan.find(callback);
                },
                firms: function(callback) {
                    Firm.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected firms as checked.
                for (let i = 0; i < results.firms.length; i++) {
                    if (company.firm.indexOf(results.firms[i]._id) > -1) {
                        results.firms[i].checked='true';
                    }
                }
                res.render('company_form', { title: 'Create Company',titans:results.titans, firms:results.firms, company: company, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save company.
            company.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new company record.
                   res.redirect(company.url);
                });
        }
    }
];



// Display company delete form on GET.
exports.company_delete_get = function(req, res, next) {

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id).populate('titan').populate('firm').exec(callback);
        },
        company_companyinstances: function(callback) {
            CompanyInstance.find({ 'company': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.company==null) { // No results.
            res.redirect('/data/companys');
        }
        // Successful, so render.
        res.render('company_delete', { title: 'Delete Company', company: results.company, company_instances: results.company_companyinstances } );
    });

};

// Handle company delete on POST.
exports.company_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id).populate('titan').populate('firm').exec(callback);
        },
        company_companyinstances: function(callback) {
            CompanyInstance.find({ 'company': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.company_companyinstances.length > 0) {
            // Company has company_instances. Render in same way as for GET route.
            res.render('company_delete', { title: 'Delete Company', company: results.company, company_instances: results.company_companyinstances } );
            return;
        }
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

    // Get company, titans and firms for form.
    async.parallel({
        company: function(callback) {
            Company.findById(req.params.id).populate('titan').populate('firm').exec(callback);
        },
        titans: function(callback) {
            Titan.find(callback);
        },
        firms: function(callback) {
            Firm.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.company==null) { // No results.
                var err = new Error('Company not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected firms as checked.
            for (var all_g_iter = 0; all_g_iter < results.firms.length; all_g_iter++) {
                for (var company_g_iter = 0; company_g_iter < results.company.firm.length; company_g_iter++) {
                    if (results.firms[all_g_iter]._id.toString()==results.company.firm[company_g_iter]._id.toString()) {
                        results.firms[all_g_iter].checked='true';
                    }
                }
            }
            res.render('company_form', { title: 'Update Company', titans:results.titans, firms:results.firms, company: results.company });
        });

};


// Handle company update on POST.
exports.company_update_post = [

    // Convert the firm to an array.
    (req, res, next) => {
        if(!(req.body.firm instanceof Array)){
            if(typeof req.body.firm==='undefined')
            req.body.firm=[];
            else
            req.body.firm=new Array(req.body.firm);
        }
        next();
    },

    // Validate fields.
    body('company_name', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('titan', 'Titan must not be empty.').isLength({ min: 1 }).trim(),
    body('leadership_page_url', 'Bloomberg URL must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    // sanitizeBody('company_name').trim().escape(),
    // sanitizeBody('titan').trim().escape(),
    // sanitizeBody('leadership_page_url').trim().escape(),
    // sanitizeBody('firm.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Company object with escaped/trimmed data and old id.
        var company = new Company(
          { company_name: req.body.company_name,
            investment_date: req.body.investment_date,
            titan: req.body.titan,
            leadership_page_url: req.body.leadership_page_url,
            titanhouse_url: req.body.titanhouse_url,
            firm: (typeof req.body.firm==='undefined') ? [] : req.body.firm,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all titans and firms for form
            async.parallel({
                titans: function(callback) {
                    Titan.find(callback);
                },
                firms: function(callback) {
                    Firm.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected firms as checked.
                for (let i = 0; i < results.firms.length; i++) {
                    if (company.firm.indexOf(results.firms[i]._id) > -1) {
                        results.firms[i].checked='true';
                    }
                }
                res.render('company_form', { title: 'Update Company',titans:results.titans, firms:results.firms, company: company, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Company.findByIdAndUpdate(req.params.id, company, {}, function (err,thecompany) {
                if (err) { return next(err); }
                   // Successful - redirect to company detail page.
                   res.redirect(thecompany.url);
                });
        }
    }
];

