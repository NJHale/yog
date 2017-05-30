/*******************
* REQUIRED MODULES *
*******************/
var cp = require('child_process');
var express = require('express');
var http = require('http');
var app = express();
var proxy = require('express-http-proxy');
var url = require('url');

// Get the config module
var config = require('./config');

var server = http.createServer(app);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**************************************************
* REGISTER PORT 8080 FOR APPLICATION TO LISTEN ON *
**************************************************/
server.listen(8080, function () {
  console.log('App listening on port 8080!');
});

/*******************************************************************
* ACQUIRE ENVIRONMENT VARIABLES FOR HOST:PORT TO PROXY REQUESTS TO *
*******************************************************************/


/****************************************************************
* REGISTER DIRECTORY CONTENT TO BE VIEWED BY APP AS / DIRECTORY *
****************************************************************/

//dist folder that typescript compiles to
app.use(express.static(__dirname + '/dist'));

/**********
* ROUTING *
**********/

// Add routers and routing middle-ware for internal api
// ./routers/index.js is the default code to be hit
var appRouters = require('./routers');
app.use(appRouters);

/**
* Redirect pages used by the frontend to index.html for everything else
*/
app.get('*', function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});


/**************************
* DATA COLLECTION DAEMONS *
**************************/

try {
  // Fork and start the child process
  var fork = cp.fork('./collector.controller').on('message', (msgStr) => {
    var msg = JSON.parse(msgStr);
    console.log(`Message from child process received: ${msg.status}`);
  });

  // Trigger the child process to start collecting data
  fork.send(JSON.stringify({
    msg: 'start',
    collectorNames: ['UtilizationCollector']
  }));

  // Handle nodejs shutdown
  process.on('exit', () => {
    try {
      fork.kill();
    } catch(ex) {
      console.log(`An exception occurred while killing child process: ${ex}`);
    }
  });
} catch (ex) {
  console.log(`An exception has occurred during daemon process kickoff: ${ex}`);
}
