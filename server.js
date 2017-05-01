/*******************
* REQUIRED MODULES *
*******************/
var express = require('express');
var http = require('http');
var app = express();
var proxy = require('express-http-proxy');
var url = require('url');

// Get the config module
var config = require('./config');

const server = http.createServer(app);

/**************************************************
* REGISTER PORT 8080 FOR APPLICATION TO LISTEN ON *
**************************************************/
server.listen(8080, function () {
  console.log('App listening on port 8080!');
});

/*******************************************************************
* ACQUIRE ENVIRONMENT VARIABLES FOR HOST:PORT TO PROXY REQUESTS TO *
*******************************************************************/

//BASE URL for the "WHATEVER" API calls
const WHATEVER_BASE_URL = `http://whatever`;


/****************************************************************
* REGISTER DIRECTORY CONTENT TO BE VIEWED BY APP AS / DIRECTORY *
****************************************************************/

//dist folder that typescript compiles to
app.use(express.static(__dirname + '/dist'));

/************
* ENDPOINTS *
************/

/**
 * Test endpoint
 */
app.get('/test/', function(req, res){
  res.send("angular-test/test/");
});

// ./routes/index.js is the default code to be hit
var appRoutes = require('./routes');
app.use(appRoutes);


/****************************
* Define APIs to forward to *
****************************/

/**
 * Setup the request forwarding for the WHATEVER API
 */
var whateverApiProxy = proxy(WHATEVER_BASE_URL, {
  forwardPath: function(req, res) {
    var baseUrl = req.originalUrl.replace('/api/whatever/', '/');
    return url.parse(baseUrl).path;
  }
});

//Tell the app to use the whateverApiProxy on request
app.use('/api/whatever/*', whateverApiProxy);

/**********
* ROUTING *
**********/

/**
* Redirect pages used by the frontend to index.html
*/
app.get('*', function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});
