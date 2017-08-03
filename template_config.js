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
    'dbURI': 'mongodb://kirk:kirk@ds137090.mlab.com:37090/kirkbrewtemp',
    'LOGIN_ACCESS_KEY': 'I_A4b-YRdWJZc686Q1CuLHNlYOaeRLXRd95HOOzB_1mG-1EZgK_gesPJtL1N0xIDop3lHM15HXqW1FF5BdcVUw',
    'LOGIN_ACCESS_SECRET': 'DYW16MQO2QGtekp0aSNSJkxrKFZydmk7gEo8UPTiVenRL4iHkGUKPvQMPIfyZKpEE25_DpC_hpemv1b-GY8VPw',
    'HOST': 'https://morning-eyrie-46634.herokuapp.com/'
};
