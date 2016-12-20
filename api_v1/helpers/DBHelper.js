/**
 * Database helper methods
 * 
 */
var mongoose = require('mongoose');
//Database models
var Client = mongoose.model('clients');
var Temperature = mongoose.model('temperature');

exports.getClientsCount = function () {
    return Client
        .count({})
        .exec()
        .then((count) => {
            return count;
        });
};

exports.getClients = function (startIndex, pageSize) {
    return Client
        .find()
        .select('-__v')
        .select()
        .skip(startIndex)
        .limit(pageSize)
        .exec();
};

exports.getClientByID = function (clientID) {
    return Client
        .findOne({"_id": clientID})
        .select('-__v')
        .exec();
};

exports.getTemperaturesCount = function (clientID, from, to) {
    return Temperature
        .find({"client_id": clientID})
        .where('timestamp').gte(from).lte(to)
        .count()
        .exec()
        .then((count) => {
            return count;
        });
};

exports.getTemperatures = function(clientID, from, to, startIndex, pageSize) {
    if (!from) {
        from = new Date(-8640000000000000);
    }
    if (!to) {
        to = Date.now();
    }
    return Temperature
        .find({"client_id": clientID})
        .where('timestamp').gte(from).lte(to)
        .select('client_id')
        .select('timestamp')
        .select('data')
        .select('-_id')
        .sort({timestamp: 1})
        .skip(startIndex)
        .limit(pageSize)
        .exec();
};

exports.dropTemperatures = function() {
    return Temperature
        .remove({});
};