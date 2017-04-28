// index.js

// Require appropriate modules
var express = require('express');

var bodyParser = require('body-parser');

// Get the configuration object
var config = require('../config');

// Require all app routes
var dropboxRoutes = require('./dropbox.routes');
var dropboxHealthRoutes = require('./dropbox.health.routes');
var dropboxHeartbeatRoutes = require('./dropbox.heartbeat.routes');
var dropboxRegistryRoutes = require('./dropbox.registry.routes');
var dropboxPickupRoutes = require('./dropbox.pickup.routes');

// Get an instance of an express router
var routes = express.Router();

// Configure the express router to use body-parser as middleware to handle post requests
routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());

// Use all app routes at the base path
routes.use('/',
  [
    dropboxRoutes,
    dropboxHealthRoutes,
    dropboxHeartbeatRoutes,
    dropboxPickupRoutes,
    dropboxRegistryRoutes
  ]
);

// Define a default health path at /
routes.get('/', (req, res) => {
  try {
    console.log('nodejs-dropbox-store running on ' + process.env.APP_POD_NAME);
    // Return a 200 'OK'
    res.status(200).send(`nodejs-dropbox-store running on ${process.env.APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while responding to readiness check at /: ${err}`);
  }
});

// Export the routes as an unnamed object
module.exports = routes;
