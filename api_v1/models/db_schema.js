/**
 * Database Schema
 *
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Client Schema - This collection stores client_names from the Device Server
 *
 */
var ClientSchema = Schema({
    client_name: String,
    delta: Number,
    hash: String,
    timestamp: {type: Date, default: Date.now},
    last_value: String
});

/**
 * Temperature Schema - This collection stores temperature values from DS
 *
 */
var TemperatureSchema = Schema({
    timestamp: {type: Date, default: Date.now},
    client_id: Schema.Types.ObjectId,
    client_name: {type: String, ref: 'clients'},
    data: String
});

/**
 * Compile schema to model
 *
 */
mongoose.model('clients', ClientSchema);
mongoose.model('temperature', TemperatureSchema);