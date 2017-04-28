// dropbox.js
var mongoose = require('mongoose');


// Define the DropboxSchema for mongoose
var DropboxSchema = mongoose.Schema({
  dropboxId: String,
  packageCount: Number,
  openedCount: Number,
  time: Number
});

// Export the Dropbox "constructor" as a named function
exports.DropboxSchema = DropboxSchema;
