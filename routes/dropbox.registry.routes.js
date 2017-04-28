// dropbox.registry.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var DropboxRegistrySchema =
  require('../schemas/dropbox.registry.schema').DropboxRegistrySchema;

// Create the mongoose model and instance of all models
var DropboxRegistry = mongoose.model('dropboxregistry', DropboxRegistrySchema);
// Create latest model for latestregistry collection
var LatestDropboxRegistry =
  mongoose.model('latestdropboxregistry', DropboxRegistrySchema);

// Get and express router instance
var routes = express.Router();

/**
 * DropboxRegistry endpoint for getting all DropboxRegistries
 * @type {Boolean}
 */
routes.get('/dropboxRegistries', (req, res) => {
  try {
    console.log('/dropboxRegistries');
    // Perform a find all with mongoose
    DropboxRegistry.find((err, registries) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when getting the dropbox registries:
          ${err}`);
        // Return an error
        res.status(400).json(err);
      } else {
        // Change status to 200 "OK" and package the json response
        res.status(200).json(registries);
      }
    });
  } catch (err) {
    // Set and send status 500 "Internal Server Error"
    res.status(500).json(JSON.stringify(err));
  }
});



/**
 * Dropbox endpoint for getting the latest dropbox registries
 * @type {Boolean}
 */
routes.get('/dropboxRegistries/latest', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Check for query parameter idLike
    var idLike = req.query.idLike;
    console.log(`?idLike=${idLike}`);
    var regex = new RegExp(`^${idLike}`, 'g');

    LatestDropboxRegistry.find((err, registries) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when getting the latest dropbox registries: ${err}`);
        // Return an error
        res.status(400).json(err);
      } else {
        if (idLike) {
          // Remove all non-matching registries
          for (var i = 0; i < registries.length; i++) {
            var registry = registries[i];
            if (!registry.dropboxId.match(regex)) {
              // Remove and correct index
              registries.splice(i, 1);
              i--;
            }
          }
        }
        // Change status to 200 "OK" and package the json response
        res.status(200).json(registries);
      }
    }).limit(Number(num));
  } catch (err) {
      // Set and send status 500 "Internal Server Error"
      res.status(500).json(JSON.stringify(err));
  }
});


/**
 * DropboxRegistry endpoint for getting all registries of a particular id
 * @type {Boolean}
 */
routes.get('/dropboxRegistries/:dropboxId', (req, res) => {
  try {
    var dropboxId = req.params.dropboxId;
    console.log(`This is the id we got! dropboxId: ${dropboxId}`);
    // Make sure we were given a dropboxId to query
    if (dropboxId) {
      // Perform a find on the dropboxId
      DropboxRegistry.find({ dropboxId: dropboxId }, (err, registries) => {
        // Check for an error case
        if (err !== null) {
          console.log(`An error was detected when getting the registries: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and package the json response
          res.status(200).json(registries);
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

routes.post('/dropboxRegistries', (req, res) => {
  // The request should be able to be cast to type Package
  try {
    // Instantiate a new Dropbox with given json
    console.log(`Post request recieved on /dropboxRegistries: ${JSON.stringify(req.body)}`);
    var dropboxRegistry = new DropboxRegistry(req.body);

    dropboxRegistry.save((err, dropboxRegistry) => {
      if (err) {
        console.log(`An error was detected when saving the dropbox: ${err}`);
        // Return an error
        res.status(500).json(JSON.stringify(err));
      } else {
        // Change status to 201 "Created"
        res.status(201).send();
        // Request a latest registry map reduce
        reduceRegistries.requested = true;
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
 * in the latestregistry collection
 */
function reduceRegistries() {
  // Set reducing to true
  this.reducing = true;
  // Instantiate the map reduce function in an object
  var mapReduce = {};
  // Create the map function (dropboxId -> dropbox)
  mapReduce.map = function() {
    emit(this.dropboxId, this);
  };
  // Create the reduce function (Only return the latest registry objects)
  mapReduce.reduce = function(dropboxId, registries) {
    // Iterate through the registries, searching for the latest registry
    // We're assuming it was a min heap (implemented as array it would be at the last index)
    var latest = registries[registries.length - 1];
    // Return the latest ckn
    return latest;
  };

  // Send mongo the DropboxRegistry map reduce function and callback
  DropboxRegistry.mapReduce(mapReduce, (err, reduction) => {
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
          latest.push(new LatestDropboxRegistry(r.value));
        }
        // Delete everything in the latestdropbox collection
        LatestDropboxRegistry.remove({}, (err) => {
          if(err) {
            console.log(`An error occured while attempting to remove all elements
              from the latestdropbox collection\n${err}`);
          }
          // Attempt to add the new latest to the collection
          for (var registry of latest) {
            registry.save();
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

// Define the requested and reducing flags on the reduceRegistries function
reduceRegistries.requested = false;
reduceRegistries.reducing = false;

// Create an interval for the registries to be reduced on
var reductionInterval = setInterval(() => {
  //console.log('Checking for reduction requests...')
  // Check if a reduce has been requested and one is not currently running
  if (reduceRegistries.requested && !reduceRegistries.reducing) {
    console.log(`DropboxRegistry reduction request detected!
      \nKicking off new reduction at ${Date.now()}`);
    // Set requested to false
    reduceRegistries.requested = false;
    // Reduce the registries
    reduceRegistries();
  } else {
    //console.log('Reduction request not detected.');
  }
  //console.log('Continuing to next interval...');
}, config.reductionDT);

// Export the routes as an unnamed object
module.exports = routes;
