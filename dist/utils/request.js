'use strict';

var requestLib = require('request');

function doRequest(opts, limit) {
  var req = requestLib;
  return new Promise(function (resolve, reject) {
    return req(opts, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      if (response.statusCode >= 400) {
        return reject({
          response: response
        });
      }
      resolve(body);
    });
  });
}

function request(opts, limit) {
  return doRequest(opts, limit).then(function (response) {
    return response;
  }).catch(function (reason) {
    if (reason.response && reason.response.statusCode === 404) {
      throw Error('App not found (404)');
    }
    console.log('opts:', opts);
    throw Error('Error requesting:' + reason.message);
  });
}

module.exports = request;