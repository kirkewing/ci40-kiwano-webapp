/**
 * Methods to manage DB data and support CRUD operations
 *
 */
var mongoose = require('mongoose');
var config = require('../../config');
var client = mongoose.model('clients');
var temperature = mongoose.model('temperature');
var Utils = require('../helpers/Utils');

exports.updateClient = function (item, data) {
    var completeClientURLHash = Utils.getClientIDFromURL(item.Links[1].href);
    client.find({"hash": completeClientURLHash}, function (err, docs) {
        if (err) {
            console.error("Could not find client %s", item.Name);
            return;
        }
        if (docs.length === 0) {
            console.error("Docs is empty!");
            return;
        }
        docs[0].update({"_id": docs[0]._id},
            {
                $set: {
                    client_name: item.Name,
                    last_value: data.SensorValue,
                    hash: completeClientURLHash
                }
            },
            function (err) {
                if (err) {
                    console.error("Failed to update client: %s", item.Name);
                    return;
                }
                console.log("Client updated: [%s, %s]", item.Name, data.SensorValue);
            });
    });
};

function insertClient(c, hash) {
    var newClient = new client({
        client_name: c.Name,
        delta: 0.4,
        hash: hash,
        last_value: 0
    });
    return newClient.save();
}

exports.tryInsertClient = function (c) {
    var clientURLHash = Utils.getClientIDFromURL(c.Links[1].href);
    var clientData = c;
    console.log("Trying to store client: %s", clientData.Name);
    return client.findOne({"hash": clientURLHash})
        .exec()
        .then((doc) => {
            if (!doc) { //client does not exist
                return insertClient(clientData, clientURLHash)
                    .then(() => {
                        return clientData;
                    });
            }
            return clientData;
        });
};

exports.tryInsertClients = function (items, handler) {
    if (items && items.length >= 0) {

        return Promise.all(items.map((item) => {
            var clientURLHash = Utils.getClientIDFromURL(item.Links[1].href);
            var clientData = item;
            return client.findOne({"hash": clientURLHash})
                .exec()
                .then((doc) => {
                    if (!doc) { //client does not exist
                        return insertClient(clientData, clientURLHash).
                            then(() => {
                                return clientData;
                            });
                    }
                    return clientData;
                });
            }))
            .then((results) => {
                if (results.length) {
                    return Promise.all(results);
                }
                return null;
            });
    }
    else {
        console.log("No client found!");
        return [];
    }
};


exports.handleTemperatureChanged = function (req, res, handler) {
    res.sendStatus(200);
    req.body.Items.forEach(function (item) {
        if (item.SubscriptionType && item.Value && item.Value.SensorValue !== undefined) {
            var completeClientURLHash = Utils.getClientIDFromURL(item.Links[1].href);
            client.find({"hash": completeClientURLHash}, function (err, docs) {
                if (docs.length === 0) {
                    console.log("Couldn't find client matching hash: " + completeClientURLHash);
                    return;
                }

                var c = docs[0];
                console.log("Temperature changed: %s, %s", c.client_name, item.Value.SensorValue);
                var entry = new temperature(
                    {
                        client_id: c._id,
                        client_name: c.client_name,
                        data: item.Value.SensorValue,
                        timestamp: item.TimeTriggered
                    });
                entry.save(function (err) {
                    if (err) {
                        console.log('Error on saving temperature data for client [%s]', c.client_name);
                    } else {
                        console.log('Successfully saved new measurement for client [%s]', c.client_name);
                        client.update({"_id": c._id},
                            {
                                $set: {
                                    last_value: item.Value.SensorValue,
                                    timestamp: item.TimeTriggered,
                                    hash: completeClientURLHash
                                }
                            },
                            function (err) {
                                if (err) {
                                    console.log('Error on updating client [%s] with new measurement. %s', c.client_name, err);
                                } else {
                                    console.log('Successfully updated client [%s] with new measurement', c.client_name);
                                }
                            });
                    }
                });
            });
        }
        else {
            console.error("Observation notification contains invalid payload. %s", JSON.stringify(item));
        }
    });
};