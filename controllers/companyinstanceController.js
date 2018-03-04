var CompnayInstance = require('../models/companyinstance')
var Compnay = require('../models/company')
var async = require('async')

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all CompnayInstances.
exports.companyinstance_list = function(req, res, next) {

  CompnayInstance.find()
    .populate('company')
    .exec(function (err, list_companyinstances) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('companyinstance_list', { title: 'Compnay Instance List', companyinstance_list:  list_companyinstances});
    })

};

// Display detail page for a specific CompnayInstance.
exports.companyinstance_detail = function(req, res, next) {

    CompnayInstance.findById(req.params.id)
    .populate('company')
    .exec(function (err, companyinstance) {
      if (err) { return next(err); }
      if (companyinstance==null) { // No results.
          var err = new Error('Compnay copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('companyinstance_detail', { title: 'Compnay:', companyinstance:  companyinstance});
    })

};

// Display CompnayInstance add form on GET.
exports.companyinstance_add_get = function(req, res, next) {

     Compnay.find({},'title')
    .exec(function (err, companys) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('companyinstance_form', {title: 'Add CompnayInstance', company_list:companys } );
    });

};

// Handle CompnayInstance add on POST.
exports.companyinstance_add_post = [

    // Validate fields.
    body('company', 'Compnay must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('company').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Add a CompnayInstance object with escaped and trimmed data.
        var companyinstance = new CompnayInstance(
          { company: req.body.company,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Compnay.find({},'company_name')
                .exec(function (err, companys) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('companyinstance_form', { title: 'Add CompnayInstance', company_list : companys, selected_company : companyinstance.company._id , errors: errors.array(), companyinstance:companyinstance });
            });
            return;
        }
        else {
            // Data from form is valid
            companyinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(companyinstance.url);
                });
        }
    }
];



// Display CompnayInstance delete form on GET.
exports.companyinstance_delete_get = function(req, res, next) {

    CompnayInstance.findById(req.params.id)
    .populate('company')
    .exec(function (err, companyinstance) {
        if (err) { return next(err); }
        if (companyinstance==null) { // No results.
            res.redirect('/data/companyinstances');
        }
        // Successful, so render.
        res.render('companyinstance_delete', { title: 'Delete CompnayInstance', companyinstance:  companyinstance});
    })

};

// Handle CompnayInstance delete on POST.
exports.companyinstance_delete_post = function(req, res, next) {
    
    // Assume valid CompnayInstance id in field.
    CompnayInstance.findByIdAndRemove(req.body.id, function deleteCompnayInstance(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of CompnayInstance items.
        res.redirect('/data/companyinstances');
        });

};

// Display CompnayInstance update form on GET.
exports.companyinstance_update_get = function(req, res, next) {

    // Get company, titans and firms for form.
    async.parallel({
        companyinstance: function(callback) {
            CompnayInstance.findById(req.params.id).populate('company').exec(callback)
        },
        companys: function(callback) {
            Compnay.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.companyinstance==null) { // No results.
                var err = new Error('Compnay copy not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('companyinstance_form', { title: 'Update  CompnayInstance', company_list : results.companys, selected_company : results.companyinstance.company._id, companyinstance:results.companyinstance });
        });

};

// Handle CompnayInstance update on POST.
exports.companyinstance_update_post = [

    // Validate fields.
    body('company', 'Compnay must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('company').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Add a CompnayInstance object with escaped/trimmed data and current id.
        var companyinstance = new CompnayInstance(
          { company: req.body.company,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Compnay.find({},'company_name')
                .exec(function (err, companys) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('companyinstance_form', { title: 'Update CompnayInstance', company_list : companys, selected_company : companyinstance.company._id , errors: errors.array(), companyinstance:companyinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            CompnayInstance.findByIdAndUpdate(req.params.id, companyinstance, {}, function (err,thecompanyinstance) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(thecompanyinstance.url);
                });
        }
    }
];
