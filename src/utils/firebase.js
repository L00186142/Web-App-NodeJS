const admin = require('firebase-admin');
const serviceAccount = require('../src/config/cloud-messaging-bb47e-firebase-adminsdk-60rde-a7b8906375.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com', // Replace with your actual database URL
});

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = { admin, db, messaging };
