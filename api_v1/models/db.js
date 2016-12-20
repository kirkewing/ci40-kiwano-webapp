/**
 * Manage DB connection
 */
var mongoose = require('mongoose');
var config = require('./../../config.js');
var gracefulShutdown;
var dbURI = config.dbURI;

// Enable production mode to use Mlab database
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
    // dbURI = mongodb://..
}

mongoose.Promise = global.Promise; // to avoid warning
mongoose.connect(dbURI);

// Connection events/ output status
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
// Close Mongoose connection
gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// For nodemon restarts (listen event SIGUSR2)
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app termination/ close connection/ graceful shutdown
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    });
});

// For Heroku app termination
process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app termination', function () {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./db_schema');
