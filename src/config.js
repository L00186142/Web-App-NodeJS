const functions = require('firebase-functions');

module.exports = {
  google: {
    clientId: functions.config().google.client_id,
    clientSecret: functions.config().google.client_secret,
    redirectUri: functions.config().google.redirect_uri,
  },
};
