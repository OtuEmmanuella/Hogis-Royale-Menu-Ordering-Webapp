const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

// Initialize Firebase Admin SDK with the project ID and service account
admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

// Example usage of Firestore
const db = admin.firestore();

// Example to fetch documents from a collection
db.collection("test").get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  })
  .catch(error => {
    console.error("Error getting documents: ", error);
  });
