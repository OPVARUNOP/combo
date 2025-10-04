const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

// Explicit configuration
const config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://combo-624e1.firebaseio.com', // Try with and without -default-rtdb
  projectId: 'combo-624e1',
};

console.log('Initializing with config:', {
  ...config,
  credential: '[REDACTED]', // Don't log the actual credential
});

admin.initializeApp(config, 'test-app-' + Date.now()); // Use unique app name

const db = admin.firestore();

// Test 1: List collections
db.listCollections()
  .then((collections) => {
    console.log(
      '✅ Success! Collections:',
      collections.map((c) => c.id)
    );
  })
  .catch((error) => {
    console.error('❌ Error listing collections:', error.code, error.message);

    // Test 2: Try to create a document
    console.log('\nTrying to create a test document...');
    return db.collection('test-collection').doc('test-doc').set({
      test: 'value',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  })
  .then(() => {
    console.log('✅ Successfully created test document');
  })
  .catch((error) => {
    console.error('❌ Error creating test document:', error.code, error.message);

    // Test 3: Try to get app options
    const app = admin.app();
    console.log('\nApp options:', {
      name: app.name,
      projectId: app.options.projectId,
      databaseURL: app.options.databaseURL,
    });
  });
