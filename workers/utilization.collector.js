// util.collector.js

// Require appropriate modules
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

// Require the configuration object
var config = require('../config');

// Require appropriate schemas
var UtilizationSchema = require('../schemas/utilization.schema');

// Create the mongoose model and instance of all models
var Utilization = mongoose.model('Utilization', UtilizationSchema);
// Also create a mongoose model for the latest Utilizations
var LatestUtilization = mongoose.model('LatestUtilization', UtilizationSchema);

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
      if (err != null) {
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
    var util = new Utilization({
        namespace: quotas.items[i].metadata.namespace,
        quotaName: quotas.items[i].metadata.name,
        cpuLimit: quotas.items[i].status.hard[0],
        cpuUsed: quotas.items[i].status.used[0],
        memLimit: quotas.items[i].status.hard[1],
        memUsed: quotas.items[i].status.used[1],
        podsLimit: quotas.items[i].status.hard.pods,
        podsUsed: quotas.items[i].status.used.pods
    });
    // Push the Utilization onto the stack
    utils.push(util);
  }

  return utils;
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
    console.log(`error: ${err}`);
    console.log(`resp: ${JSON.stringify(resp)}`);
    console.log(`body: ${body}`);
    //console.log(`elements of body: ${JSON.parse(JSON.stringify(body)).keys()}`);

    var utils = getUtilizations(JSON.parse(body));
    console.log(`utils: ${JSON.stringify(utils)}`);

  });

}
