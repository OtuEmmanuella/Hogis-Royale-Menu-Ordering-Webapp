const admin = require('firebase-admin');

// Path to your service account key file
let serviceAccount = require('./src/Key/hogis-royale-menu-firebase-adminsdk-atxqb-ff6756e1af.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };