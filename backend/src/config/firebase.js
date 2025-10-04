const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Enable offline support
db.settings({
  ignoreUndefinedProperties: true,
});

// Create a batch for batch operations
const batch = db.batch();

module.exports = {
  db,
  auth,
  storage,
  batch,
  FieldValue: admin.firestore.FieldValue,
  Timestamp: admin.firestore.Timestamp,
};
