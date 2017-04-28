// dropbox.health.routes.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var DropboxHealthSchema =
  require('../schemas/dropbox.health.schema').DropboxHealthSchema;

// Create the mongoose model and instance of all models
var DropboxHealth =
  mongoose.model('dropboxhealth', DropboxHealthSchema);

// Get and express router instance
var routes = express.Router();

/**
 * [dropboxHealth description]
 * @type {[type]}
 */
routes.post('/dropboxHealth', (req, res) => {
  // The request should be able to be cast to type DropboxHealth
  try {
    // Instantiate a new DropboxHealth with given json
    console.log(`Post request received on /dropboxHealth: ${JSON.stringify(req.body)}`);
    var dropboxHealth = new DropboxHealth(req.body);
    console.log(`DropboxHealth successfully cast: ${dropboxHealth}`);

    dropboxHealth.save((err, dropboxHealth) => {
      if (err) {
        console.log(`An error was detected when saving the dropbox health: ${err}`);
        // Return an error
        res.status(500).json(JSON.stringify(err));
      } else {
        console.log('Health successfully stored!');
        // Change status to 201 "Created"
        res.status(201).send();
      }
    });
  } catch (ex) {
    console.log('Houston - We have a problemo...' + ex);
    // Something went wrong on our side. Send a 500 'Server Error'
    res.status(500).json(JSON.stringify(ex));
  }
});

/**
 * DropboxHealth endpoint for getting all registries of a particular id
 * @type {Boolean}
 */
routes.get('/dropboxHealth/:dropboxId', (req, res) => {
  try {
    // Get the number of elements to retrieve - null should be 0 to get all
    var num = req.query.num === null ? 0 : req.query.num;
    // Get the dropboxId
    var dropboxId = req.params.dropboxId;
    console.log(`Getting health for dropboxId: ${dropboxId}`);
    // Make sure we were given a dropboxId to query
    if (dropboxId) {
      // Perform a find on the dropboxId
      DropboxHealth.find({ dropboxId: dropboxId }, (err, healths) => {
        // Check for an error case
        if (err !== null) {
          console.log(`An error was detected when getting the health: ${err}`);
          // Return an error
          res.status(400).json(err);
        } else {
          console.log('Hey we found some stuff');
          // Change status to 200 "OK" and package the json response
          res.status(200).json(healths);
        }
      }).sort({ time: 'descending' }).limit(Number(num));
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
