// util.collector.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var UtilizationSchema = require('../schemas/utilization.schema');

// Create the mongoose model and instance of all models
var Utlization = mongoose.model('utilization', UtilizationSchema);
// Also create a mongoose model for the latest Utilizations
var LatestUtilization = mongoose.model('latestutilization', UtilizationSchema);

// Declare an empty interval object
var intervals = null;

// Handle messages from parent process
process.on('message', (msg) => {
  if (msg == "stop") {
    stopCollecting();
    console.log(`[${process.pid}]: Collection stopped!`);
  } else if (msg == "start") {
    startCollecting();
    console.log(`[${process.pid}]: Collection started.`);
  }
});

process.on('exit', () => {
  stopCollecting();
  console.log(`[${process.pid}]: Collection stopped! Process exiting...`);
});

/**
 * Stops the collection of utilizations by clearing the interval
 */
function stopCollecting() {
  if (interval != null) {
    clearInterval(interval);
    interval = null
  }
}

/**
 * Starts the collection of utilizations by setting the interval
 * with a closure calling the collectUtilizations function
 */
function startCollecting() {
  interval = setInterval(() => {
    collectUtilizations((err) => {
      if (err != null) {
        console.log(`[${process.pid}]: Some error occured while attempting to
          collect utilizations: \n${err}`);
      }
    });
  }, config.kubePollingDT);
}

/**
 * Uses the Kubernetes API to collect and store namespace utilizations
 */
function collectUtilizations(callback) {
  console.log(`[${process.pid}]: collectUtilizations called!`);
}
