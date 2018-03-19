var express = require('express');
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require('passport-local');


// Require our controllers.
var company_controller = require('../controllers/companyController');
var titan_controller = require('../controllers/titanController');
var firm_controller = require('../controllers/firmController');
var user_controller = require('../controllers/userController');



// COMPANY ROUTES ///

// GET data home page.
router.get('/', isLoggedIn, company_controller.index);

// GET request for creating a Company. NOTE This must come before routes that display Company (uses id).
router.get('/company/add/:firm_id', isLoggedIn, company_controller.company_add_get);

// POST request for creating Company.
router.post('/company/add/:firm_id', isLoggedIn, company_controller.company_add_post);

// GET request to delete Company.
router.get('/company/:id/delete', isLoggedIn, company_controller.company_delete_get);

// POST request to delete Company.
router.post('/company/:id/delete', isLoggedIn, company_controller.company_delete_post);

// GET request to update Company.

router.get('/company/:id/update', isLoggedIn, company_controller.company_update_get);

// POST request to update Company.
router.post('/company/:id/update', isLoggedIn, company_controller.company_update_post);

// GET request for one Company.
router.get('/company/:id', isLoggedIn, company_controller.company_detail);

// GET request for list of all Company.
router.get('/companys', isLoggedIn, company_controller.company_list);

// GET request for new titan
// router.get('/company/:id/company_get_new_titan', company_controller.company_get_new_titan);
//
// router.post('/company/:id/company_post_new_titan', company_controller.company_post_new_titan);


/// TITAN ROUTES ///

// GET request for creating Titan. NOTE This must come before route for id (i.e. display titan).
router.get('/titan/add/:company_id', isLoggedIn, titan_controller.titan_add_get);

// POST request for creating Titan.
router.post('/titan/add/:company_id', isLoggedIn, titan_controller.titan_add_post);

// GET request to delete Titan.
router.get('/titan/:id/delete', isLoggedIn, titan_controller.titan_delete_get);

// POST request to delete Titan
router.post('/titan/:id/delete', isLoggedIn, titan_controller.titan_delete_post);

// GET request to update Titan.
router.get('/titan/:id/update', isLoggedIn, titan_controller.titan_update_get);

// POST request to update Titan.
router.post('/titan/:id/update', isLoggedIn, titan_controller.titan_update_post);

// GET request for one Titan.
router.get('/titan/:id', isLoggedIn, titan_controller.titan_detail);

// GET request for list of all Titans.
router.get('/titans', isLoggedIn, titan_controller.titan_list);


/// FIRM ROUTES ///

// GET request for creating a Firm. NOTE This must come before route that displays Firm (uses id).
router.get('/firm/add', isLoggedIn, firm_controller.firm_add_get);

// POST request for creating Firm.
router.post('/firm/add', isLoggedIn, firm_controller.firm_add_post);

// GET request to delete Firm.
router.get('/firm/:id/delete', isLoggedIn, firm_controller.firm_delete_get);

// POST request to delete Firm.
router.post('/firm/:id/delete', isLoggedIn, firm_controller.firm_delete_post);

// GET request to update Firm.
router.get('/firm/:id/update', isLoggedIn, firm_controller.firm_update_get);

// POST request to update Firm.
router.post('/firm/:id/update', isLoggedIn, firm_controller.firm_update_post);

// GET request for one Firm.
router.get('/firm/:id', isLoggedIn, firm_controller.firm_detail);

// GET request for list of all Firm.
router.get('/firms', isLoggedIn, firm_controller.firm_list);

router.get('/users', user_controller.user_list);

router.get('/user/:id', isLoggedIn, user_controller.user_detail);



function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


module.exports = router;
