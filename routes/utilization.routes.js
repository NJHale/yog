// utilization.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var UtilizationSchema = require('../schemas/utilization.schema');

// Create the mongoose model and instance of all models
var Utilization = mongoose.model('Utilization', UtilizationSchema);
// Also create a mongoose model for the latest Utilizations
var LatestUtilization = mongoose.model('latestutilization', UtilizationSchema);

// Get an express router instance
var routes = express.Router();

 /**
  * Utlization endpoint for getting all dropboxes
  * @type {[type]}
  */
routes.get('/utilizations', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Perform a find all with mongoose
    Utilization.find((err, utils) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when retrieving utilizations: ${err}`);
        // Respond with an error
        res.status(400).json(err);
      } else {
        // Change status to 200 "OK" and utilization the json response
        res.status(200).json(utils);
      }
    }).limit(Number(num));
  } catch (ex) {
    // Set and send status 500 "Internal Service Error"
    res.status(500).json(JSON.stringify(ex));
  }
});

/**
 * utilization endpoint for getting all utilizations of a particular namespace
 * @type {Boolean}
 */
routes.get('/utilizations/:namespace', (req, res) => {
  try {
    var namespace = req.params.namespace;
    console.log(`namespace: ${namespace}`);
    // Make sure we were given a namespace to query
    if (namespace) {
      // Perform a find on the namespace
      Utilization.find({ namespace: namespace }, (err, utilizations) => {
        // Check for an error case
        if (err) {
          console.log(`An error was detected while getting the utilizations: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and utilization the json response
          res.status(200).json(utilizations);
        }
      }).sort({ time: 'descending' });
    } else {
      // Set and send status 400 "Bad Request"
      res.status(400).send('A namespace parameter must be provided.');
    }
  } catch (ex) {
    console.log(ex);
    // Set and send status 400 "Bad Request"
    res.status(400).json(JSON.stringify(ex));
  }
});

// Export the express router as an unnamed object
module.exports = routes;
