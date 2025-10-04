const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

console.log('Initializing Firebase Admin...');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
});

console.log('Firebase Admin initialized successfully');

// Test Firestore
const firestore = admin.firestore();
console.log('Testing Firestore access...');
firestore
  .collection('test')
  .doc('connection-test')
  .set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'success',
  })
  .then(() => {
    console.log('✅ Successfully wrote to Firestore');

    // Test Realtime Database
    console.log('Testing Realtime Database access...');
    const db = admin.database();
    return db.ref('test/connection').set({
      timestamp: Date.now(),
      status: 'success',
    });
  })
  .then(() => {
    console.log('✅ Successfully wrote to Realtime Database');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
