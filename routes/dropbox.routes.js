// dropbox.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var DropboxSchema = require('../schemas/dropbox.schema').DropboxSchema;
var DropboxRegistrySchema =
  require('../schemas/dropbox.registry.schema').DropboxRegistrySchema;

// Create the mongoose model and instance of all models
var Dropbox = mongoose.model('dropbox', DropboxSchema);
// Also create a mongoose model for latest dropboxes
var LatestDropbox = mongoose.model('latestdropbox', DropboxSchema);
var DropboxRegistry = mongoose.model('dropboxregistry', DropboxRegistrySchema);

// Get an express router instance
var routes = express.Router();

/**
 * Dropbox endpoint for getting all dropboxes
 * @type {Boolean}
 */
routes.get('/dropboxes', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Perform a find all with mongoose
    Dropbox.find((err, dropboxes) => {
      // Check for an error case
      if (err !== null) {
        console.log(`An error was detected when getting the dropboxes:
          ${err}`);
        // Return an error
        res.status(400).json(err);
      } else {
        // Change status to 200 "OK" and package the json response
        res.status(200).json(dropboxes);
      }
    }).limit(Number(num));
  } catch (err) {
    // Set and send status 500 "Internal Server Error"
    res.status(500).json(JSON.stringify(err));
  }
});


/**
 * Dropbox endpoint for getting the latest dropboxes
 * @type {Boolean}
 */
routes.get('/dropboxes/latest', (req, res) => {
 try {
   // Get the number of elements to retrieve - null should be 0 to get all
   var num = req.query.num === null ? 0 : req.query.num;
   // Check for query parameter idLike
   var idLike = req.query.idLike;
   console.log(`?idLike=${idLike}`);
   var regex = new RegExp(`^${idLike}`, 'g');

   LatestDropbox.find((err, dropboxes) => {
     // Check for an error case
     if (err !== null) {
       console.log(`An error was detected when getting the latest dropboxes: ${err}`);
       // Return an error
       res.status(400).json(err);
     } else {
       // If an idLike was defined, drop all not-like id elements
       if (idLike) {
         for (var i = 0; i < dropboxes.length; i++) {
           var dropbox = dropboxes[i];
           if (!dropbox.dropboxId.match(idLike)) {
             // Remove dropbox and correct index
             dropboxes.splice(i, 1);
             i--;
           }
         }
       }
       // Change status to 200 "OK" and dropbox the json response
       res.status(200).json(dropboxes);
     }
   }).limit(Number(num));
 } catch (err) {
     // Set and send status 500 "Internal Server Error"
     res.status(500).json(JSON.stringify(err));
 }
});

/**
 * Dropbox endpoint for getting all dropboxes of a particular id
 * @type {Boolean}
 */
routes.get('/dropboxes/:dropboxId', (req, res) => {
  try {
    var dropboxId = req.params.dropboxId;
    console.log(`This is the id we got! dropboxId: ${dropboxId}`);
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Make sure we were given a dropboxId to query
    if (dropboxId) {
      // Perform a find on the dropboxId
      Dropbox.find({ dropboxId: dropboxId }, (err, dropboxes) => {
        // Check for an error case
        if (err !== null) {
          console.log(`An error was detected when getting the dropboxes: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and package the json response
          res.status(200).json(dropboxes);
        }
      }).sort({ time: 'descending' }).limit(Number(num));
    } else {
      // Set and send status 400 "Bad Request"
      res.status(400).send('A dropboxId parameter must be provided.');
    }
  } catch (err) {
    console.log(err);
    // Set and send status 400 "Bad Request"
    res.status(400).json(JSON.stringify(err));
  }
});


/**
 * Posts a dropbox into the mongodb Dropbox collection if it has already been
 * inserted in the DropboxRegistry collection.
 * @type {Package}
 */
routes.post('/dropboxes', (req, res) => {
  // The request should be able to be cast to type Package
  try {
    // Instantiate a new Dropbox with given json
    console.log(req.body);
    var dropbox = new Dropbox(req.body);
    // Check to see if the dropbox is registered
    DropboxRegistry.find(
      { dropboxId: dropbox.dropboxId }, 'dropboxId', (err, dropboxId) => {
          if (err) {
            console.log(`An error occured while attempting to get a
              dropbox with that id\n${err}`);
          }
          // If the dropbox is registered, add it to the collection
          if (dropboxId.length > 0) {
            // Add the Dropbox to the collection
            dropbox.save((err, dropbox) => {
              if (err) {
                console.log(`An error was detected when saving the dropbox:
                  ${err}`);
                // Return an error
                res.status(500).json(JSON.stringify(err));
              } else {
                // Change status to 201 "Created"
                res.status(201).send();
                // Request a latest dropbox map reduce
                reduceDropboxes.requested = true;
              }
            });
          } else {
            // The Dropbox must be registered before being added to the collection
            // Change status to 428 "Precondition Required"
            res.status(428).send(`Dropbox ${dropbox.dropboxId} must be registered before being added to the dropbox store.`);
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
 * in the latestdropbox collection
 */
function reduceDropboxes() {
  // Set reducing to true
  this.reducing = true;
  // Instantiate the map reduce function in an object
  var mapReduce = {};
  // Create the map function (dropboxId -> dropbox)
  mapReduce.map = function() {
    emit(this.dropboxId, this);
  };
  // Create the reduce function (Only return the latest dropbox objects)
  mapReduce.reduce = function(dropboxId, dropboxes) {
    // Iterate through the dropboxes, searching for the latest dropbox
    // We're assuming it was a min heap (implemented as array it would be at the last index)
    var latest = dropboxes[dropboxes.length - 1];
    // Return the latest ckn
    return latest;
  };

  // Perform a find all with mongoose
  dropbox.mapReduce(mapReduce, (err, reduction) => {
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
          latest.push(new LatestDropbox(r.value));
        }
        // Delete everything in the latestdropbox collection
        LatestDropbox.remove({}, (err) => {
          if(err) {
            console.log(`An error occured while attempting to remove all elements
              from the latestdropbox collection\n${err}`);
          }
          // Attempt to add the new latest to the collection
          for (var dropbox of latest) {
            dropbox.save();
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

// Define the requested and reducing flags on the reduceDropboxes function
reduceDropboxes.requested = false;
reduceDropboxes.reducing = false;

// Create an interval for the dropboxes to be reduced on
var reductionInterval = setInterval(() => {
  //console.log('Checking for reduction requests...')
  // Check if a reduce has been requested and one is not currently running
  if (reduceDropboxes.requested && !reduceDropboxes.reducing) {
    console.log(`Dropbox reduction request detected!
      \nKicking off new reduction at ${Date.now()}`);
    // Set requested to false
    reduceDropboxes.requested = false;
    // Reduce the dropboxes
    reduceDropboxes();
  } else {
    //console.log('Reduction request not detected.');
  }
  //console.log('Continuing to next interval...');
}, config.reductionDT);

// Export the routes as an unnamed object
module.exports = routes;
