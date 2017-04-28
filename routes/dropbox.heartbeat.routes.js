// dropbox.heartbeat.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var DropboxHeartbeatSchema =
  require('../schemas/dropbox.heartbeat.schema').DropboxHeartbeatSchema;

// Create the mongoose model and instance of all models
var DropboxHeartbeat =
  mongoose.model('dropboxheartbeat', DropboxHeartbeatSchema);

// Get and express router instance
var routes = express.Router();

/**
 * [dropboxHeartbeats description]
 * @type {[type]}
 */
routes.post('/dropboxHeartbeats', (req, res) => {
  // The request should be able to be cast to type DropboxHeartbeat
  try {
    // Instantiate a new DropboxHeartbeat with given json
    console.log(`Post request received on /dropboxHeartbeats: ${JSON.stringify(req.body)}`);
    var dropboxHeartbeat = new DropboxHeartbeat(req.body);

    dropboxHeartbeat.save((err, dropboxHeartbeat) => {
      if (err) {
        console.log(`An error was detected when saving the dropbox heartbeat: ${err}`);
        // Return an error
        res.status(500).json(JSON.stringify(err));
      } else {
        console.log('Heartbeat successfully stored!');
        // Change status to 201 "Created"
        res.status(201).send();
      }
    });
  } catch (e) {
    console.log('Houston - We have a problemo...');
    // Something went wrong on our side. Send a 500 'Server Error'
    res.status(500).json(JSON.stringify(e));
  }
});

/**
 * DropboxHeartbeat endpoint for getting all registries of a particular id
 * @type {Boolean}
 */
routes.get('/dropboxHeartbeats/:dropboxId', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Get the dropboxId
    var dropboxId = req.params.dropboxId;
    console.log(`Getting heartbeats for dropboxId: ${dropboxId}`);
    // Make sure we were given a dropboxId to query
    if (dropboxId) {
      // Perform a find on the dropboxId
      DropboxHeartbeat.find({ dropboxId: dropboxId }, (err, heartbeats) => {
        // Check for an error case
        if (err !== null) {
          console.log(`An error was detected when getting the heartbeats: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          // Change status to 200 "OK" and package the json response
          res.status(200).json(heartbeats);
        }
      }).sort({ time: 'descending' })
        .limit(Number(num));
    } else {
      // Set and send status 400 "Bad Request"
      res.status(400).send('A dropboxId parameter must be provided.');
    }
  } catch (ex) {
    console.log(ex);
    // Set and send status 500 "Server Error"
    res.status(500).json(JSON.stringify(ex));
  }
});

// Export the express router as an unnamed object
module.exports = routes;
