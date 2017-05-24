// util.collector.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var UtilizationSchema = require('../schemas/utilization.schema').UtilizationSchema;

// Create the mongoose model and instance of all models
var Utilization = mongoose.model('utilization', UtilizationSchema);
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
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
  }
}

/**
 * Starts the collection of utilizations by setting the interval
 * with a closure calling the collectUtilizations function
 */
function startCollecting() {
  interval = setInterval(() => {
    collectUtilizations((err) => {
      if (err !== null) {
        console.log(`[${process.pid}]: Some error occured while attempting to
          collect utilizations: \n${err}`);
      }
    });
  }, config.kubePollingDT);
}

/**
 * Parses the given Kubernetes ResourceQuotaList and returns a stack of
 * Utilization mongo models
 * @param  {ResourceQuotaList} quotas Kubernetes ResourceQuotaList to parse
 * @return {Utilization[]}
 */
function getUtilizations(quotas) {
  // Parse the ResourceQuotaList and marshall/push Utiliation objects for each ResourceQuota
  var utils = [];
  for (var i = 0; i < quotas.items.length; i++) {
    // Instantiate a new Utilization mongo model with the resource quota list data
    var util = {
        namespace: quotas.items[i].metadata.namespace,
        quotaName: quotas.items[i].metadata.name,
        cpuLimit: quotas.items[i].status.hard["limits.cpu"],
        cpuUsed: quotas.items[i].status.used["limits.cpu"],
        memLimit: quotas.items[i].status.hard["limits.memory"],
        memUsed: quotas.items[i].status.used["limits.memory"],
        podsLimit: quotas.items[i].status.hard.pods,
        podsUsed: quotas.items[i].status.used.pods
    };
    // Push the Utilization onto the stack
    utils.push(util);
  }

  return utils;
}

/**
 * Takes a new Utilization object, and checks to see if it exists in
 * LatestUtilizations. If it does, update it with the latest data. If not,
 * create the document.
 * @param  {object} latest the new Utilization object
 */
function updateOrCreateLatestUtilization(latest) {

  // Search the LatestUtilization collection for existing document with
  // composite key <namespace, quotaName>
  LatestUtilization.find({namespace: latest.namespace, quotaName: latest.quotaName}, (err, foundUtils) => {

    // The utilization object that will be saved to mongo
    var utilToSave;

    // If there is an error, log it, otherwise process the result
    if(err) {
      console.log(`Error while finding utils: ${err}`);
    } else {

      // If a utilization matching the composite key was found, update it.
      // Otherwise,
      if (foundUtils) {
        console.log('Util already exists, updating...');
        console.log(`Old ID: ${foundUtils[0]}`);

        // Create new LatestUtilization
        utilToSave = new LatestUtilization(foundUtils[0]);
        console.log(`New ID: ${utilToSave._id}`);

        // Use the info from the new utilization object to update the document
        // that will be saved
        utilToSave.namespace = latest.namespace;
        utilToSave.quotaName = latest.quotaName;
        utilToSave.cpuLimit = latest.cpuLimit;
        utilToSave.cpuUsed = latest.cpuUsed;
        utilToSave.memLimit = latest.memLimit;
        utilToSave.memUsed = latest.memUsed;
        utilToSave.podsLimit = latest.podsLimit;
        utilToSave.podsUsed = latest.podsUsed;
      } else {
        console.log('Util does not exist, creating...');

        // Create a new LatestUtilization based off of the new utilization object
        utilToSave = new LatestUtilization(latest);
      }

      // Save the new/update LatestUtilization document
      utilToSave.save((err, result) => {
        if(err) console.log(`Error while saving util: ${err}`);
        else console.log(`Save successful: ${result}`);
      });
    }
  });
}

/**
 * Uses the Kubernetes API to collect and store namespace utilizations
 */
function collectUtilizations(callback) {
  console.log(`[${process.pid}]: collectUtilizations called!`);

  // Call the Kubernetes API and get all resource quotas
  request.get(config.kubeAPIURL + '/api/v1/resourcequotas', {
    'auth': {
      'bearer': config.kubeAuthToken
    }
  },(err, resp, body) => {

    // If there is an error, log it
    if(err) console.log(`error: ${err}`);

    // Retreive the latest utilizations
    var utils = getUtilizations(JSON.parse(body));
    console.log(`utils: ${utils}`);

    // Bulk create new documents for all of the latest Utilizations
    Utilization.create(utils, (err, latestUtils) => {
      if (err) {
        console.log(`error: ${err}`);
        callback(err);
      } else {
        console.log(`storedUtils: ${latestUtils}`);

        // Iterate over all of the utilization objects that were returned
        for (var latest of latestUtils) {

          // Update or save the latest document
          updateOrCreateLatestUtilization(latest);
        }
      }
    });

  });

}
