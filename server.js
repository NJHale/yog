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

// Add routes and routing middle-ware for internal api
// ./routes/index.js is the default code to be hit
var appRoutes = require('./routes');
app.use(appRoutes);

/**************************
* DATA COLLECTION DAEMONS *
**************************/

// Fork and start the child process
var fork = cp.fork('./workers/utilization.collector').on('message', (msg) => {
  console.log(`Message from child process received: ${msg}`);
});

// Trigger the child process to start collecting data
fork.send('start');

// Handle nodejs shutdown
process.on('exit', () => {
  try {
    fork.kill();
  } catch(ex) {
    console.log(`An exception occurred while killing child process: ${ex}`);
  }
});
