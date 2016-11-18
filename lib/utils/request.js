const requestLib = require('request');

function doRequest(opts, limit) {
  let req = requestLib;
  return new Promise((resolve, reject) => req(opts, function(error, response,
    body) {
    if (error) {
      return reject(error);
    }
    if (response.statusCode >= 400) {
      return reject({
        response
      });
    }
    resolve(body);
  }));
}

function request(opts, limit) {
  return doRequest(opts, limit)
    .then(function(response) {
      return response;
    })
    .catch(function(reason) {
      if (reason.response && reason.response.statusCode === 404) {
        throw Error('App not found (404)');
      }
      console.log('opts:', opts);
      throw Error('Error requesting:' + reason.message);
    });
}

module.exports = request;
