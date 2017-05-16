// index.js

// Require appropriate modules
var express = require('express');

var bodyParser = require('body-parser');

// Get the configuration object
var config = require('../config');

// Require all app routes
var utilizationRoutes = require('./utilization.routes');
var infoRoutes = require('./info.routes.js');

// Get an instance of an express router
var routes = express.Router();

// Configure the express router to use body-parser as middleware to handle post requests
routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());

// ** BOILERPLATE FOR API PROXYING **
// const WHATEVER_BASE_URL = 'https://whatever';
//
// /**
//  * Setup the request forwarding for the proxy api
//  */
// var apiProxy = proxy(WHATEVER_BASE_URL, {
//   forwardPath: function(req, res) {
//     var baseUrl = req.originalUrl.replace('/api/whatever/', '/');
//     return url.parse(baseUrl).path;
//   }
// });
//
//
//
// routes.use('/api-proxy',
//   [
//     apiProxy
//   ]
// );

// Use all app routes at the base path
routes.use('/api',
  [
    utilizationRoutes,
    infoRoutes
  ]
);

// Define a default health path at /
routes.get('/health', (req, res) => {
  try {
    console.log('yog running on ' + process.env.APP_POD_NAME);
    // Return a 200 'OK'
    res.status(200).send(`yog running on ${process.env.APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while responding to readiness check at /: ${err}`);
  }
});

/**
* Redirect pages used by the frontend to index.html for everything else
*/
routes.get('*', function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});

// Export the routes as an unnamed object
module.exports = routes;
