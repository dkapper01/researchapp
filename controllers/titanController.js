var Titan = require('../models/titan')
var async = require('async')
var Compnay = require('../models/company')

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Titans.
exports.titan_list = function (req, res, next) {

    Titan.find()
        .sort([['bloomberg_url', 'ascending']])
        .exec(function (err, list_titans) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('titan_list', { title: 'Titan List', titan_list: list_titans });
        })

};

// Display detail page for a specific Titan.
exports.titan_detail = function (req, res, next) {

    async.parallel({
        titan: function (callback) {
            Titan.findById(req.params.id)
                .exec(callback)
        },
        titans_companys: function (callback) {
            Compnay.find({ 'titan': req.params.id }, 'title leadership_page_url')
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
        res.render('titan_detail', { title: 'Titan Detail', titan: results.titan, titan_companys: results.titans_companys });
    });

};

// Display Titan add form on GET.
exports.titan_add_get = function (req, res, next) {
    res.render('titan_form', { title: 'Add Titan' });
};

// Handle Titan add on POST.
exports.titan_add_post = [

    // Validate fields.
    body('titan_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
        // .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('bloomberg_url').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
        // .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('start_date', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    // sanitizeBody('titan_name').trim().escape(),
    // sanitizeBody('bloomberg_url').trim().escape(),
    // sanitizeBody('start_date').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('titan_form', { title: 'Add Titan', titan: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Add an Titan object with escaped and trimmed data.
            var titan = new Titan(
                {
                    titan_name: req.body.titan_name,
                    start_date: req.body.start_date,
                    bloomberg_url: req.body.bloomberg_url,
                    linkedin_url: req.body.linkedin_url
                });
            titan.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new titan record.
                res.redirect(titan.url);
            });
        }
    }
];



// Display Titan delete form on GET.
exports.titan_delete_get = function (req, res, next) {

    async.parallel({
        titan: function (callback) {
            Titan.findById(req.params.id).exec(callback)
        },
        titans_companys: function (callback) {
            Compnay.find({ 'titan': req.params.id }).exec(callback)
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
            Compnay.find({ 'titan': req.body.titanid }).exec(callback)
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

    Titan.findById(req.params.id, function (err, titan) {
        if (err) { return next(err); }
        if (titan == null) { // No results.
            var err = new Error('Titan not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('titan_form', { title: 'Update Titan', titan: titan });

    });
};

// Handle Titan update on POST.
exports.titan_update_post = [

    // Validate fields.
    body('titan_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
        // .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('bloomberg_url').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
        // .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('start_date', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    // sanitizeBody('titan_name').trim().escape(),
    // sanitizeBody('bloomberg_url').trim().escape(),
    // sanitizeBody('start_date').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Add Titan object with escaped and trimmed data (and the old id!)
        var titan = new Titan(
            {
                titan_name: req.body.titan_name,
                start_date: req.body.start_date,
                bloomberg_url: req.body.bloomberg_url,
                linkedin_url: req.body.linkedin_url,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('titan_form', { title: 'Update Titan', titan: titan, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Titan.findByIdAndUpdate(req.params.id, titan, {}, function (err, thetitan) {
                if (err) { return next(err); }
                // Successful - redirect to firm detail page.
                res.redirect(thetitan.url);
            });
        }
    }
];
