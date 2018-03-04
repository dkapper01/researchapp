var express = require('express');
var router = express.Router();


// Require our controllers.
var company_controller = require('../controllers/companyController');
var titan_controller = require('../controllers/titanController');
var firm_controller = require('../controllers/firmController');
var company_instance_controller = require('../controllers/companyinstanceController');


/// COMPANY ROUTES ///

// GET data home page.
router.get('/', company_controller.index);

// GET request for creating a Compnay. NOTE This must come before routes that display Compnay (uses id).
router.get('/company/add', company_controller.company_add_get);

// POST request for creating Compnay.
router.post('/company/add', company_controller.company_add_post);

// GET request to delete Compnay.
router.get('/company/:id/delete', company_controller.company_delete_get);

// POST request to delete Compnay.
router.post('/company/:id/delete', company_controller.company_delete_post);

// GET request to update Compnay.
router.get('/company/:id/update', company_controller.company_update_get);

// POST request to update Compnay.
router.post('/company/:id/update', company_controller.company_update_post);

// GET request for one Compnay.
router.get('/company/:id', company_controller.company_detail);

// GET request for list of all Compnay.
router.get('/companys', company_controller.company_list);

/// TITAN ROUTES ///

// GET request for creating Titan. NOTE This must come before route for id (i.e. display titan).
router.get('/titan/add', titan_controller.titan_add_get);

// POST request for creating Titan.
router.post('/titan/add', titan_controller.titan_add_post);

// GET request to delete Titan.
router.get('/titan/:id/delete', titan_controller.titan_delete_get);

// POST request to delete Titan
router.post('/titan/:id/delete', titan_controller.titan_delete_post);

// GET request to update Titan.
router.get('/titan/:id/update', titan_controller.titan_update_get);

// POST request to update Titan.
router.post('/titan/:id/update', titan_controller.titan_update_post);

// GET request for one Titan.
router.get('/titan/:id', titan_controller.titan_detail);

// GET request for list of all Titans.
router.get('/titans', titan_controller.titan_list);


/// FIRM ROUTES ///

// GET request for creating a Firm. NOTE This must come before route that displays Firm (uses id).
router.get('/firm/add', firm_controller.firm_add_get);

// POST request for creating Firm.
router.post('/firm/add', firm_controller.firm_add_post);

// GET request to delete Firm.
router.get('/firm/:id/delete', firm_controller.firm_delete_get);

// POST request to delete Firm.
router.post('/firm/:id/delete', firm_controller.firm_delete_post);

// GET request to update Firm.
router.get('/firm/:id/update', firm_controller.firm_update_get);

// POST request to update Firm.
router.post('/firm/:id/update', firm_controller.firm_update_post);

// GET request for one Firm.
router.get('/firm/:id', firm_controller.firm_detail);

// GET request for list of all Firm.
router.get('/firms', firm_controller.firm_list);


/// COMPANYINSTANCE ROUTES ///

// GET request for creating a CompnayInstance. NOTE This must come before route that displays CompnayInstance (uses id).
router.get('/companyinstance/add', company_instance_controller.companyinstance_add_get);

// POST request for creating CompnayInstance.
router.post('/companyinstance/add', company_instance_controller.companyinstance_add_post);

// GET request to delete CompnayInstance.
router.get('/companyinstance/:id/delete', company_instance_controller.companyinstance_delete_get);

// POST request to delete CompnayInstance.
router.post('/companyinstance/:id/delete', company_instance_controller.companyinstance_delete_post);

// GET request to update CompnayInstance.
router.get('/companyinstance/:id/update', company_instance_controller.companyinstance_update_get);

// POST request to update CompnayInstance.
router.post('/companyinstance/:id/update', company_instance_controller.companyinstance_update_post);

// GET request for one CompnayInstance.
router.get('/companyinstance/:id', company_instance_controller.companyinstance_detail);

// GET request for list of all CompnayInstance.
router.get('/companyinstances', company_instance_controller.companyinstance_list);


module.exports = router;
