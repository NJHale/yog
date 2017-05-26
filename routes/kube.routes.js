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

    var namespaces = JSON.parse(body).items;
    var names = [];

    for(var i = 0; i < namespaces.length; i++) {
      names.push(namespaces[i].metadata.name);
    }

    var response = {
      "namespaces": names
    };

    res.send(JSON.stringify(response));
  });
});

routes.get('/nodes', (req, res) => {
  request.get(config.kubeAPIURL + '/api/v1/nodes?labelSelector=region%3Dprimary', {
    'auth': {
      'bearer': config.kubeAuthToken
    }
  }, (err, resp, body) => {
    var capacities = [];
    if(err) console.log(`error: ${err}`);
    else {
      var items = JSON.parse(body).items;
      console.log(`nodes: ${items}`);
      for(var i = 0; i < items.length; i++) {
        capacities.push(items[i].status.capacity);
        capacities[i].name = items[i].metadata.name;
      }
    }
    res.send(JSON.stringify(capacities, null, 3));
  });
});

module.exports = routes;
