// dropbox.health.js
var mongoose = require('mongoose');

// Define the DropboxHealthSchema for mongoose
var DropboxHealthSchema = mongoose.Schema({
  dropboxId: String,
  batteryLevel: Number,
  signalStrength: String,
  signalBER: String,
  time: Number
});

// Export the DropboxHealthSchema "constructor" as a named function
exports.DropboxHealthSchema = DropboxHealthSchema;
