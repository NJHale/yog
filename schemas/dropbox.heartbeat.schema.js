// dropbox.heartbeat.js
var mongoose = require('mongoose');

// Define the DropboxHeartbeatSchema for mongoose
var DropboxHeartbeatSchema = mongoose.Schema({
  dropboxId: String,
  irSensorValue: String,
  time: Number
});

// Export the DropboxHeartbeatSchema "constructor" as a named function
exports.DropboxHeartbeatSchema = DropboxHeartbeatSchema;
