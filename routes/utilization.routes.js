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
var LatestUtilization = mongoose.model('LatestUtilization', UtilizationSchema);

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
    // Request a map reduce
    //reduceUtilizations.requested = true;
    // Get the namespace path parameter
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

/**
 * Package endpoint for getting the latest utilizations
 * @type {Boolean}
 */
routes.get('/utilizations/latest/:namespace', (req, res) => {
  try {
    // Get the namespace
    var namespace = req.params.namespace;
    console.log(`namespace: ${namespace}`);

    if (namespace) {
      // Perform a find on the namespace
      LatestUtilization.find({ namespace: namespace }, (err, utilizations) => {
        // Check for an error case
        if (err) {
          console.log(`An error was detected while getting the latest utilizations: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and utilization the json response
          res.status(200).json(utilizations);
        }
      }).sort({ time: 'descending' });
    } else {
      // Perform a find all
      LatestUtilization.find((err, utilizations) => {
        // Check for an error case
        if (err) {
          console.log(`An error was detected while getting the latest utilizations: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and utilization the json response
          res.status(200).json(utilizations);
        }
      }).sort({ time: 'descending' });
    }

  } catch (err) {
      // Set and send status 500 "Internal Server Error"
      res.status(500).json(JSON.stringify(err));
  }
});



/**
 * Performs a map-reduce on the utilization collection and stores the result
 * in the latestutil collection
 */
function reduceUtilizations() {
  // Set reducing to true
  this.reducing = true;
  // Instantiate the map reduce function in an object
  var mapReduce = {};
  // Create the map function (utilizationId -> utilization)
  mapReduce.map = () => {
    emit([this.quotaName, this.namespace], this);
  };
  // Create the reduce function (Only return the latest util objects)
  mapReduce.reduce = (utilId, utilizations) => {
    // Iterate through the utilizations, searching for the latest util
    // We're assuming it was a min heap (implemented as array it would be at the last index)
    var latest = utilizations[utilizations.length - 1];
    // Return the latest ckn
    return latest;
  };

  // Send mongo the Utilization map reduce function and callback
  Utilization.mapReduce(mapReduce, (err, reduction) => {
    try {
      console.log(`Map reduce reduction: ${JSON.stringify(reduction)}`);
      // Check for an error case
      if (err) {
        // Set reducing to false
        this.reducing = false;
        console.log(`An error was detected when performing a map-reduce
          ${err}`);
      } else {
        // Collect each value from the id-value tuples in the reduction array
        var latest = [];
        for (var r of reduction) {
          latest.push(new LatestUtilization(r.value));
        }
        // Delete everything in the LatestUtilization collection
        LatestUtilization.remove({}, (err) => {
          if(err) {
            console.log(`An error occured while attempting to remove all elements
              from the LatestUtilization collection\n${err}`);
          }
          // Attempt to add the new latest to the collection
          for (var util of latest) {
            util.save();
          }
          // Set reducing to false
          this.reducing = false;
          console.log('Map-reduce completed!');
        });
      }
    } catch (err) {
      // Set reducing to false
      this.reducing = false;
      console.log(`An error was detected when updating the LatestUtilization collection
        ${err}`);
    }

  });
}

// Define the requested and reducing flags on the reduceUtilizations function
reduceUtilizations.requested = false;
reduceUtilizations.reducing = false;

// Create an interval for the utilizations to be reduced on
var reductionInterval = setInterval(() => {
  //console.log('Checking for reduction requests...')
  // Check if a reduce has been requested and one is not currently running
  if (reduceUtilizations.requested && !reduceUtilizations.reducing) {
    console.log(`Utilization reduction request detected!
      \nKicking off new reduction at ${Date.now()}`);
    // Set requested to false
    reduceUtilizations.requested = false;
    // Reduce the utilizations
    reduceUtilizations();
  } else {
    //console.log('Reduction request not detected.');
  }
  //console.log('Continuing to next interval...');
}, config.reductionDT);

// Export the express router as an unnamed object
module.exports = routes;
