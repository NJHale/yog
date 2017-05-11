// utilization.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var UtilizationSchema = require('../schemas/utilization.schema');

// Create the mongoose model and instance of all models
var Utlization = mongoose.model('utilization', UtilizationSchema);
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
        // Change status to 200 "OK" and package the json response
        res.status(200).json(utils);
      }
    }).limit(Number(num));
  } catch (ex) {
    // Set and send status 500 "Internal Service Error"
    res.status(500).json(JSON.stringify(ex));
  }
});

// Export the express router as an unnamed object
module.exports = routes;
