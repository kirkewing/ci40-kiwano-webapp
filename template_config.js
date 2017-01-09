/**
 * Define in this file configuration variables for the webapp.
 *
 * The secret word consists in a decoded jwt. Send the enconded token, into the
 * requests header: 'x-access-token': 'encoded_jwt'.
 *
 * dbURI is the the string to connect to the local mongodb database.
 *
 * Access and create account in: https://console.creatordev.io/index.html#/access-keys
 * to generate API access keys: LOGIN_ACCESS_KEY and LOGIN_ACCESS_SECRET. Change the
 * generated keys in this file.
 * 
 * HOST is an URL address where the webapp is running, or publicly exposed.
 * If the webapp is hosted on a PaaS you may find it on ther service settings.
 * If you're running the app locally, you should provide here the proxy address.
 *  
 */
module.exports = {
    'secret': 'secret',
    'dbURI': 'mongodb://localhost/test_db',
    'LOGIN_ACCESS_KEY': 'Developer_Console_Access_Key',
    'LOGIN_ACCESS_SECRET': 'Developer_Console_Access_Secret',
    'HOST': 'http://host_URL'
};