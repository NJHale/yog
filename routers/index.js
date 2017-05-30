// index.js

// Require appropriate modules
var express = require('express');

var bodyParser = require('body-parser');

// Get the configuration object
var config = require('../config');

// Require all app routers
var utilizationRouter = require('./utilization.router');
var kubeRouter = require('./kube.router');

// Get an instance of an express router
var router = express.Router();

// Configure the express router to use body-parser as middleware to handle post requests
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

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
// router.use('/api-proxy',
//   [
//     apiProxy
//   ]
// );

// Use all app routers at the base path
router.use('/api',
  [
    utilizationRouter,
    kubeRouter
  ]
);

// Define a default health path at /
router.get('/health', (req, res) => {
  try {
    console.log('yog running on ' + process.env.APP_POD_NAME);
    // Return a 200 'OK'
    res.status(200).send(`yog running on ${process.env.APP_POD_NAME}`);
  } catch (err) {
    console.log(`Something went wrong while responding to readiness check at /: ${err}`);
  }
});

// Export the router as an unnamed object
module.exports = router;
