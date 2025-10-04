const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

console.log('Initializing Firebase Admin...');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
});

console.log('Firebase Admin initialized successfully');

// Get a reference to the database
const db = admin.database();

// Test reading from the database
console.log('Testing database connection...');

db.ref('connection-test')
  .once('value')
  .then((snapshot) => {
    const data = snapshot.val();
    console.log('✅ Successfully connected to Realtime Database');
    console.log('Connection test data:', data || 'No data found at /connection-test');

    // List all root-level nodes
    return db.ref('/').once('value');
  })
  .then((snapshot) => {
    console.log('\nRoot-level nodes:');
    snapshot.forEach((childSnapshot) => {
      console.log(`- ${childSnapshot.key} (${typeof childSnapshot.val()})`);
    });

    // Test writing to the database
    const testData = {
      timestamp: Date.now(),
      message: 'Test connection from backend server',
      status: 'success',
    };

    return db.ref('connection-test').set(testData);
  })
  .then(() => {
    console.log('\n✅ Successfully wrote test data to /connection-test');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
