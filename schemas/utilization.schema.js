// utilization.schema.js
var mongoose = require('mongoose');

var UtilizationSchema = mongoose.Schema({
  namespace: String,
  cpuUsed: String,
  cpuQuota: String,
  memUsed: String,
  memQuota: String,
  time: Number
});

exports.UtilizationSchema = UtilizationSchema;
