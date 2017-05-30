// collector.controller.js
var collectors = require('./collectors');
var collectorNames = Object.keys(collectors);

var collectorIntervalMap = new Map();

function startCollecting(collectorName) {
  console.log(`preceding collectorName: ${collectorName}`);
  var collector;
  // Check to see if the requested collector exists in the required module
  if (collectorNames.includes(collectorName)) {
    collector = collectors[collectorName];
  } else {
    throw `No collector with name ${collectorName} found`;
  }
  // Map the collector name to an interval running its collect function
  collectorIntervalMap.set(collector.name, setInterval(() => {
    collector.collect((msg) => {
      process.send(msg);
    });
  }, collector.dt));
}

/**
 * Stops the collection of utilizations by clearing the interval
 */
function stopCollecting(collectorName) {
  if (collectorIntervalMap.has(collectorName)) {
    clearInterval(collectorIntervalMap.get(collectorName));
    collectorIntervalMap.delete(collectorName);
  } else {
    throw `Err: No running collectors with name ${collectorName}`;
  }
}

process.on("message", (msgStr) => {
  try {
    console.log(`msgStr ${msgStr}`);
    var msg = JSON.parse(msgStr);
    // Check command
    if (msg.cmd === 'start') {
      // Start collecting with all of the collectors
      for (var collectorName of msg.collectorNames) {
        console.log(`CollectorName ${collectorName}`);
        if (!collectorIntervalMap.has(collectorName)) {
          startCollecting(collectorName);
        } else {
          throw `Collector ${collectorName} already running`;
        }
      }
    } else if (msg.cmd === 'stop') {
      // Start collecting with all of the collectors
      for (var collectorName of msg.collectorNames) {
          stopCollecting(collectorName);
      }
    } else {
      throw `${msg.cmd} is not a valid command string`;
    }

  } catch (ex) {
    console.log(`An exception occurred while parsing message from parent process: ${ex}`);
  }
});
