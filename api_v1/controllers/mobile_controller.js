/**
 * The mobile_controller contains the methods/querys
 * to expose the data base to mobile app.
 *
 */

const DBHelper = require('../helpers/DBHelper');
const Utils = require('../helpers/Utils');

//ToDo change to reasonable value once mobile app supports pagination links following
const DEFAULT_PAGE_SIZE = 100000;

/**
 * GET REST API Documentation
 * 
 */
exports.getApi = function (req, res, next) {
    const fullUrl = req.protocol + '://' + req.get('host') + '/api/v1';
    res.json({
        "links": [
            {
                "rel": "clients",
                "href": fullUrl + "/clients"
            },
            {
                "rel": "removeAll",
                "href": fullUrl + "/dropdb"
            }
        ]
    });
};

/**
 * GET clients from database. Supports pagination.
 * ex: /clients?startIndex=2&pageSize=3
 *
 */
exports.getClients = function (req, res, next) {

    const pageSize = parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE;
    const startIndex = parseInt(req.query.startIndex, 10) || 0;

    let totalCount = 0;
    let itemsCount = 0;

    const pageInfo = {
        'TotalCount': 0,
        'ItemsCount': 0,
        'StartIndex': startIndex
    };

    DBHelper.getClientsCount()
        .then((count) => {
            totalCount = count;
            pageInfo.TotalCount = count;
            return DBHelper.getClients(startIndex, pageSize);
        })
        .then((clients) => {

            const fullUrl = req.protocol + '://' + req.get('host') + '/api/v1/clients/';

            pageInfo.ItemsCount = clients.length;
            itemsCount = clients.length;

            let prevNextLinks = Utils.preparePrevNextLinks(fullUrl, startIndex, pageSize, totalCount);

            const temp = [];
            clients.forEach(function(client) {

                var indivlinks = [
                    {"rel": "self", "href": fullUrl + client._id},
                    {"rel": "data", "href": fullUrl + client._id + "/data"},
                    {"rel": "delta", "href": fullUrl + client._id + "/delta"},
                    {"rel": "update", "href": fullUrl + client._id}
                ];
                temp.push({"data": client, "links": indivlinks});
            });

            Utils.sendJSONresponse(res, 200, {PageInfo: pageInfo, Links: prevNextLinks, Items: temp});
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });

};

/**
 * Middleware called before all other client related API. Checks whether client 
 * with specified exists.
 * Returns 404 Not found response in case client does not exist otherwise 
 * forwards handling to next matching route.
 * 
 */
exports.checkForClientExistence = function (req, res, next) {
    DBHelper.getClientByID(req.params.client_id)
        .then((client) => {
            if (!client) {
                Utils.sendJSONresponse(res, 404, {"message": "No client with specified ID"});
                return;
            } else {
                req.client = client;
                next();
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });

};

/**
 * GET specific client by client_id
 * Ex: http://localhost:3000/api/v1/clients/57a9d48f3c45786146b3f833
 * 
 */
exports.getClientByID = function (req, res, next) {

    const client = req.client;
    const fullUrl = req.protocol + '://' + req.get('host') + '/api/v1/clients/';
    const clientLinks = [
        {"rel": "self", "href": fullUrl + client._id},
        {"rel": "data", "href": fullUrl + client._id + "/data"},
        {"rel": "delta", "href": fullUrl + client._id + "/delta"},
        {"rel": "update", "href": fullUrl + client._id}
    ];
    Utils.sendJSONresponse(res, 200, {data: client, links: clientLinks});

};

/**
 * PUT (update) specific ID (send in body)
 * 
 */
exports.updateClient = function (req, res) {

    const client = req.client;

    if (req.body.client_name)
        client.client_name = req.body.client_name;
    if (req.body.delta)
        client.delta = req.body.delta;
    client.timestamp = Date();

    client
        .save()
        .then((savedClient) => {
            res.sendStatus(204);
        })
        .catch((err) => {
            console.error(err);
            Utils.sendJSONresponse(res, 500);
        });
};

/**
 * GET specific client data
 * http://localhost:3000/api/v1/clients/:client_id/data
 * ?from=2016-08-04T12:29:09.652Z&to=2016-08-04T12:29:11.224Z
 *
 */
exports.getClientData = function (req, res, next) {

    const pageSize = parseInt(req.query.pageSize, 10) || 100000;
    const startIndex = parseInt(req.query.startIndex, 10) || 0;

    let totalCount = 0;
    let itemsCount = 0;

    const pageInfo = {
        'TotalCount': 0,
        'ItemsCount': 0,
        'StartIndex': startIndex
    };

    // Default values

    if (req.query.from === undefined || req.query.from === null) {
        //minimun date
        req.query.from = new Date(-8640000000000000);
    }
    if (req.query.to === undefined || req.query.to === null) {
        req.query.to = Date.now();
    }


    return DBHelper.getTemperaturesCount(req.params.client_id, req.query.from, req.query.to)
        .then((count) => {
            totalCount = count;
            pageInfo.TotalCount = count;
            return DBHelper
                .getTemperatures(req.params.client_id, req.query.from, req.query.to, startIndex, pageSize);
        })
        .then((temperatures) => {

            pageInfo.ItemsCount = temperatures.length;
            itemsCount = temperatures.length;

            var fullUrl = req.protocol + '://' + req.get('host') + '/api/v1/clients/';

            let prevNextLinks = Utils.preparePrevNextLinks(fullUrl, startIndex, pageSize, totalCount);

            let temp = [];
            temperatures.forEach((temperature, i, arr) => {
                let indivlinks = [
                    {"rel": "self", "href": fullUrl + temperature.client_id},
                ];
                temp.push({"data": temperature, "links": indivlinks});
            });

            Utils.sendJSONresponse(res, 200, {PageInfo: pageInfo, Links: prevNextLinks, Items: temp});
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });

};

/**
 * GET client delta (interval between data samples)
 *
 */
exports.getClientDelta = function (req, res, next) {
    const client = req.client;
    const fullUrl = req.protocol + '://' + req.get('host') + '/api/v1/clients/';
    const deltaLinks = [
        {"rel": "self", "href": fullUrl + client._id + "/delta"},
        {"rel": "update", "href": fullUrl + client._id + "/delta"}
    ];
    Utils.sendJSONresponse(res, 200, {links: deltaLinks, delta: client.delta});
};

/**
 * PUT (update) client delta
 * Ex: PUT http://localhost:3000/api/v1/clients/57a9d1ac3c45786146b3f828/delta
 * Send body: application/json
 * {"delta": "value"}
 *
 */
exports.updateClientDelta = function (req, res, next) {

    const delta = req.body.delta;

    if (req.body.delta === undefined) {
        Utils.sendJSONresponse(res, 400, {"message": "No delta param specified"});
        return;
    }
    if (!Utils.isNumeric(delta)) {
        Utils.sendJSONresponse(res, 400, {"message": "Invalid delta type. Must be numeric."});
    }

    const client = req.client;


    client.delta = delta;
    client.save()
        .then((savedClient) => {
            res.sendStatus(204);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
};

/**
 * Drops DB temperature collection
 * 
 */
exports.dropTemperatures = function (req, res, next) {
    DBHelper
        .dropTemperatures()
        .then(() => {
            res.sendStatus(204);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
};