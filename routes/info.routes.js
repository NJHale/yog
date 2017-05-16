// info.routes.js

var express = require('express');
var routes = express.Router();
var request = require('request');
var config = require('../config');

routes.get('/namespaces', (req, res) => {
  request.get(config.kubeAPIURL + '/api/v1/namespaces', {
    'auth': {
      'bearer': config.kubeAuthToken
    }
  },(err, resp, body) => {
    console.log(`error: ${err}`);
    console.log(`resp: ${JSON.stringify(resp)}`);
    console.log(`body: ${body}`);
    res.send(body);
  });
});

module.exports = routes;