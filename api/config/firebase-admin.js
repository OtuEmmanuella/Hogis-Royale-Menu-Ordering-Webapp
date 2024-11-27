const admin = require('firebase-admin');
const path = require('path'); // Import path module for safer path resolution

// Ensure the environment variable is set
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
}

// Resolve the path dynamically and require the service account key
const serviceAccount = require(path.resolve(serviceAccountPath));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore
const db = admin.firestore();

module.exports = { admin, db };
