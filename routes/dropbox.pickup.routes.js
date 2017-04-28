// dropbox.pickup.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var DropboxPickupSchema =
  require('../schemas/dropbox.pickup.schema').DropboxPickupSchema;

// Create the mongoose model and instance of all models
var DropboxPickup = mongoose.model('dropboxpickup', DropboxPickupSchema);
// Create latest model for latestpickup collection
var LatestDropboxPickup =
  mongoose.model('latestdropboxpickup', DropboxPickupSchema);

// Get and express router instance
var routes = express.Router();

/**
 * DropboxPickup endpoint for getting all DropboxPickups
 * @type {Boolean}
 */
routes.get('/dropboxPickups', (req, res) => {
  try {
    console.log('/dropboxPickups');
    // Perform a find all with mongoose
    DropboxPickup.find((err, pickups) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when getting the dropbox pickups:
          ${err}`);
        // Return an error
        res.status(400).json(err);
      } else {
        // Change status to 200 "OK" and package the json response
        res.status(200).json(pickups);
      }
    });
  } catch (err) {
    // Set and send status 500 "Internal Server Error"
    res.status(500).json(JSON.stringify(err));
  }
});



/**
 * Dropbox endpoint for getting the latest dropbox pickups
 * @type {Boolean}
 */
routes.get('/dropboxPickups/latest', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Check for query parameter idLike
    var idLike = req.query.idLike;
    console.log(`?idLike=${idLike}`);
    var regex = new RegExp(`^${idLike}`, 'g');

    LatestDropboxPickup.find((err, pickups) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when getting the latest dropbox pickups: ${err}`);
        // Return an error
        res.status(400).json(err);
      } else {
        if (idLike) {
          // Remove all non-matching pickups
          for (var i = 0; i < pickups.length; i++) {
            var pickup = pickups[i];
            if (!pickup.dropboxId.match(regex)) {
              // Remove and correct index
              pickups.splice(i, 1);
              i--;
            }
          }
        }
        // Change status to 200 "OK" and package the json response
        res.status(200).json(pickups);
      }
    }).limit(Number(num));
  } catch (err) {
      // Set and send status 500 "Internal Server Error"
      res.status(500).json(JSON.stringify(err));
  }
});


/**
 * DropboxPickup endpoint for getting all pickups of a particular id
 * @type {Boolean}
 */
routes.get('/dropboxPickups/:dropboxId', (req, res) => {
  try {
    var dropboxId = req.params.dropboxId;
    console.log(`This is the id we got! dropboxId: ${dropboxId}`);
    // Make sure we were given a dropboxId to query
    if (dropboxId) {
      // Perform a find on the dropboxId
      DropboxPickup.find({ dropboxId: dropboxId }, (err, pickups) => {
        // Check for an error case
        if (err !== null) {
          console.log(`An error was detected when getting the pickups: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and package the json response
          res.status(200).json(pickups);
        }
      }).sort({ time: 'descending' });
    } else {
      // Set and send status 400 "Bad Request"
      res.status(400).send('A dropboxId parameter must be provided.');
    }
  } catch (ex) {
    console.log(ex);
    // Set and send status 400 "Bad Request"
    res.status(400).json(JSON.stringify(ex));
  }
});

routes.post('/dropboxPickups', (req, res) => {
  // The request should be able to be cast to type Package
  try {
    // Instantiate a new Dropbox with given json
    console.log(`Post request recieved on /dropboxPickups: ${JSON.stringify(req.body)}`);
    var dropboxRegistry = new DropboxPickup(req.body);

    dropboxRegistry.save((err, dropboxRegistry) => {
      if (err) {
        console.log(`An error was detected when saving the dropbox: ${err}`);
        // Return an error
        res.status(500).json(JSON.stringify(err));
      } else {
        // Change status to 201 "Created"
        res.status(201).send();
        // Request a latest pickup map reduce
        reducePickups.requested = true;
      }
    });
  } catch (e) {
    console.log('Houston - We have a problemo...');
    // Something went wrong on our side. Send a 500 'Server Error'
    res.status(400).json(JSON.stringify(e));
  }
});

/**
 * Performs a map-reduce on the dropbox collection and stores the result
 * in the latestpickup collection
 */
function reducePickups() {
  // Set reducing to true
  this.reducing = true;
  // Instantiate the map reduce function in an object
  var mapReduce = {};
  // Create the map function (dropboxId -> dropbox)
  mapReduce.map = function() {
    emit(this.dropboxId, this);
  };
  // Create the reduce function (Only return the latest pickup objects)
  mapReduce.reduce = function(dropboxId, pickups) {
    // Iterate through the pickups, searching for the latest pickup
    // We're assuming it was a min heap (implemented as array it would be at the last index)
    var latest = pickups[pickups.length - 1];
    // Return the latest ckn
    return latest;
  };

  // Send mongo the DropboxPickup map reduce function and callback
  DropboxPickup.mapReduce(mapReduce, (err, reduction) => {
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
          latest.push(new LatestDropboxPickup(r.value));
        }
        // Delete everything in the latestdropbox collection
        LatestDropboxPickup.remove({}, (err) => {
          if(err) {
            console.log(`An error occured while attempting to remove all elements
              from the latestdropbox collection\n${err}`);
          }
          // Attempt to add the new latest to the collection
          for (var pickup of latest) {
            pickup.save();
          }
          // Set reducing to false
          this.reducing = false;
          console.log('Map-reduce completed!');
        });
      }
    } catch (err) {
      // Set reducing to false
      this.reducing = false;
      console.log(`An error was detected when updating the latestdropbox collection
        ${err}`);
    }

  });
}

// Define the requested and reducing flags on the reducePickups function
reducePickups.requested = false;
reducePickups.reducing = false;

// Create an interval for the pickups to be reduced on
var reductionInterval = setInterval(() => {
  //console.log('Checking for reduction requests...')
  // Check if a reduce has been requested and one is not currently running
  if (reducePickups.requested && !reducePickups.reducing) {
    console.log(`DropboxPickup reduction request detected!
      \nKicking off new reduction at ${Date.now()}`);
    // Set requested to false
    reducePickups.requested = false;
    // Reduce the pickups
    reducePickups();
  } else {
    //console.log('Reduction request not detected.');
  }
  //console.log('Continuing to next interval...');
}, config.reductionDT);

// Export the routes as an unnamed object
module.exports = routes;
