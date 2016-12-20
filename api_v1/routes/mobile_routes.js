/**
 * Mobile App Routes
 * Exposes the Database to the mobile app
 *
 */
var express = require('express');
var router = express.Router();
var MobileController = require('../controllers/mobile_controller');
var app = require('../../app');
var jwt = require('jsonwebtoken'); // Create, sign, and verify JSON Web Tokens

/**
 * Route middleware to verify a jwtoken
 * Not applied to POST /notification
 * secretPassword
 * 
 */
router.use(/^((?!notification).)*$/, function (req, res, next) {
    // check header or url parameters or post parameters for signed jwt
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        console.log("token = " + token);
        console.log("secret = " + req.app.get('superSecret'));
        jwt.verify(token, req.app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if pass, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // ERROR if no token
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

/**
 * @api {get} / 
 * @apiName getApi
 * @apiGroup mobile_routes
 * @apiDescription Api entry point
 * @apiUse AuthorizationHeader
 * @apiDefine AuthorizationHeader
 * @apiHeader {String} x-access-token Authorization token
 * 
 */
router.get('/', function (req, res, status) {

    MobileController.getApi(req, res, status);
});

/**
 * @api {get} /clients 
 * @apiName getClients
 * @apiGroup mobile_routes
 * @apiDescription GET all clients on DB
 * @apiUse AuthorizationHeader
 */
router.get('/clients', function (req, res, status) {
    MobileController.getClients(req, res, status);
});

/**
 * @api {get} /clients/:client_id*
 * @apiName checkForClientExistence
 * @apiGroup mobile_routes
 * @apiDescription GET specific client by client_id
 * @apiUse AuthorizationHeader
 * 
 */
router.all('/clients/:client_id*', function(req, res, next) {
    MobileController.checkForClientExistence(req, res, next);
});

/**
 * @api {get} /clients/:client_id
 * @apiName getClientByID
 * @apiGroup mobile_routes
 * @apiDescription GET specific client by client_id
 * @apiUse AuthorizationHeader
 * 
 */
router.get('/clients/:client_id', function (req, res, status) {
    MobileController.getClientByID(req, res, status);
});

/**
 * @api {put} /clients/:client_id
 * @apiName updateClient
 * @apiGroup mobile_routes
 * @apiDescription Update specific client_name (send in body)
 * @apiUse AuthorizationHeader
 * @apiParam {json} client_name Name
 * 
 */
router.put('/clients/:client_id', function (req, res, status) {
    MobileController.updateClient(req, res, status);
});

/**
 * @api {get} clients/:client_id/data
 * @apiName getClientData
 * @apiGroup mobile_routes
 * @apiDescription GET client data
 * @apiUse AuthorizationHeader
 * 
 */
router.get('/clients/:client_id/data', function (req, res, status) {
    MobileController.getClientData(req, res, status);
});

/**
 * @api {get} /clients/:client_id/delta
 * @apiName getClientDelta
 * @apiGroup mobile_routes
 * @apiDescription Get client delta (interval between data samples)
 * @apiUse AuthorizationHeader
 * 
 */
router.get('/clients/:client_id/delta', function (req, res, status) {
    MobileController.getClientDelta(req, res, status);
});

/**
 * @api {put} /clients/:client_id/delta
 * @apiName updateClientDelta
 * @apiGroup mobile_routes
 * @apiDescription Update client delta
 * @apiUse AuthorizationHeader
 * @apiParam {json} delta delta
 * 
 */
router.put('/clients/:client_id/delta', function (req, res, status) {
    MobileController.updateClientDelta(req, res, status);
});

/**
 * @api {delete} /dropdb
 * @apiName dropTemperatures
 * @apiGroup mobile_routes
 * @apiDescription Drops DB collections
 * @apiUse AuthorizationHeader
 * 
 */
router.delete('/dropdb', function (req, res, status) {
    MobileController.dropTemperatures(req, res, status);
});

module.exports = router;