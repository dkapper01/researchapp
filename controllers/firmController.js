var Firm = require('../models/firm');
var Company = require('../models/company');
var LocalStorage = require('node-localstorage').LocalStorage;
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Firm.
exports.firm_list = function(req, res, next) {

  Firm.find()
    .sort([['firm_name', 'descending']])
    .exec(function (err, list_firms) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('firm_list', { title: 'Firm List', list_firms:  list_firms});
    });
    console.log('cat');


};

// Display detail page for a specific Firm.
exports.firm_detail = function(req, res, next) {


    async.parallel({
        firm: function(callback) {
            Firm.findById(req.params.id)
              .exec(callback);
        },
        firm_company: function(callback) {
            Company.find({ 'firm': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.firm==null) { // No results.
            var err = new Error('Firm not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('firm_detail', { title: 'Firm Detail', firm: results.firm, firm_company: results.firm_company } );
    });

};

// Display Firm add form on GET.
exports.firm_add_get = function(req, res, next) {
    res.render('firm_form', { title: 'Add Firm'});
};

// Handle Firm add on POST.
exports.firm_add_post = [


    // Sanitize (trim and escape) the name field.
    sanitizeBody('firm_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {


    // Add a firm object with escaped and trimmed data.
    var firm = new Firm(
        {
            firm_name: req.body.firm_name,
            company: req.body.company,
            status: req.body.status

        });


// Data from form is valid.
// Check if Firm with same name already exists.
Firm.findOne({'firm_name': req.body.firm_name})
    .exec(function (err, found_firm) {
        if (err) {
            return next(err);
        }

        if (found_firm) {
            // Firm exists, redirect to its detail page.
            res.redirect(found_firm.url);
        }
        else {
            firm.save(function (err) {
                if (err) {
                    return next(err);
                }
                // Firm saved. Redirect to firm detail page.
                res.redirect(firm.url);
            });

        }

    });
}
];

// Display Firm delete form on GET.
exports.firm_delete_get = function(req, res, next) {

    async.parallel({
        firm: function(callback) {
            Firm.findById(req.params.id).exec(callback);
        },
        firm_companys: function(callback) {
            Company.find({ 'firm': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.firm==null) { // No results.
            res.redirect('/data/firms');
        }
        // Successful, so render.
        res.render('firm_delete', { title: 'Delete Firm', firm: results.firm, firm_companys: results.firm_companys } );
    });

};

// Handle Firm delete on POST.
exports.firm_delete_post = function(req, res, next) {

    async.parallel({
        firm: function(callback) {
            Firm.findById(req.params.id).exec(callback);
        },
        firm_companys: function(callback) {
            Company.find({ 'firm': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.firm_companys.length > 0) {
            // Firm has companys. Render in same way as for GET route.
            res.render('firm_delete', { title: 'Delete Firm', firm: results.firm, firm_companys: results.firm_companys } );
            return;
        }
        else {
            // Firm has no companys. Delete object and redirect to the list of firms.
            Firm.findByIdAndRemove(req.body.id, function deleteFirm(err) {
                if (err) { return next(err); }
                // Success - go to firms list.
                res.redirect('/data/firms');
            });

        }
    });

};

// Display Firm update form on GET.
exports.firm_update_get = function(req, res, next) {

    Firm.findById(req.params.id, function(err, firm) {
        if (err) { return next(err); }
        if (firm==null) { // No results.
            var err = new Error('Firm not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('firm_form', { title: 'Update Firm', firm: firm });
    });

};

// Handle Firm update on POST.
exports.firm_update_post = [
   
    // Validate that the firm_name field is not empty.
    body('firm_name', 'Firm firm_name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the firm_name field.
    sanitizeBody('firm_name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Add a firm object with escaped and trimmed data (and the old id!)
        var firm = new Firm(
          {
          firm_name: req.body.firm_name,
          status: req.body.status,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('firm_form', { title: 'Update Firm', firm: firm, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Firm.findByIdAndUpdate(req.params.id, firm, {}, function (err,thefirm) {
                if (err) { return next(err); }
                   // Successful - redirect to firm detail page.
                   res.redirect(thefirm.url);
                });
        }
    }
];

exports.new_company_get = function(req, res, next) {
    res.render('company_form', { title: 'Add Company'});
};

exports.company_add_get = function(req, res, next) {

    var company = new Company({

        company_name: {type: String, required: true},
        investment_date: { type: Date },
        leadership_page_url: {type: String},
        titanhouse_url: {type: String},
        titan: [{ type: Schema.ObjectId, ref: 'Titan', required: true }],
        firm: { type: Schema.ObjectId, ref: 'Firm', required: true }

    });

    company.save(function (err) {
        if (err) { return next(err); }
        //successful - redirect to new company record.
        res.redirect(company.url);
    });
};

