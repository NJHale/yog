// dropbox.pickup.js
var mongoose = require('mongoose');

// Define the DropboxPickupSchema for mongoose
var DropboxPickupSchema = mongoose.Schema({
  dropboxId: String,
  time: Number
});

// Export the DropboxPickupSchema "constructor" as a named function
exports.DropboxPickupSchema = DropboxPickupSchema;
