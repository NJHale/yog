// utilization.schema.js
var mongoose = require('mongoose');

var UtilizationSchema = mongoose.Schema({
  namespace: String,
  quotaName: String,
  cpuLimit: String,
  cpuUsed: String,
  memLimit: String,
  memUsed: String,
  podsLimit: Number,
  podsUsed: Number,
  date: { type: Date, default: Date.now }
});

exports.UtilizationSchema = UtilizationSchema;
