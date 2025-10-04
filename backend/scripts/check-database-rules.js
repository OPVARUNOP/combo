const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

console.log('Initializing Firebase Admin...');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
});

console.log('Firebase Admin initialized successfully');

// Get the database rules
const db = admin.database();

// Test read access to users
console.log('Testing read access to /users...');
db.ref('users')
  .once('value')
  .then((snapshot) => {
    console.log('✅ Successfully read from /users');
    console.log('Number of users:', Object.keys(snapshot.val() || {}).length);

    // Test write access to connection-test
    console.log('\nTesting write access to /connection-test...');
    return db.ref('connection-test').set({
      timestamp: Date.now(),
      test: 'write_test',
      status: 'success',
    });
  })
  .then(() => {
    console.log('✅ Successfully wrote to /connection-test');

    // Test creating a new user
    console.log('\nTesting user creation...');
    const newUserId = `test_${Date.now()}`;
    return db.ref(`users/${newUserId}`).set({
      email: `test_${Date.now()}@example.com`,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      status: 'active',
    });
  })
  .then(() => {
    console.log('✅ Successfully created test user');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    if (error.code === 'PERMISSION_DENIED') {
      console.log('\n⚠️  Permission denied. Please check your database rules.');
      console.log('You may need to update your rules to allow read/write access.');
    }
    process.exit(1);
  });
