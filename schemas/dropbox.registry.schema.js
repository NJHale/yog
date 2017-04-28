// dropbox.registry.schema.js
var mongoose = require('mongoose');


// Define the DropboxRegistrySchema for mongoose
var DropboxRegistrySchema = mongoose.Schema({
  dropboxId: String,
  position: [Number],
  time: Number
});

// Export the DropboxRegistry "constructor" as a named function
exports.DropboxRegistrySchema = DropboxRegistrySchema;
