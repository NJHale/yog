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

    var names = [];

    for(var i = 0; i < body.items.length; i++) {
      names.push(body.items[i].name);
    }

    var response = {
      "namespaces": names
    };

    res.send(JSON.stringify(response));
  });
});

module.exports = routes;
