const functions = require('firebase-functions');
const app = require('./app'); // Import your Express app

// Export the app to Firebase Functions
exports.app = functions.https.onRequest(app);
