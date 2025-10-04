const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// List all collections (this should work even if the database is empty)
db.listCollections()
  .then((collections) => {
    console.log('Available collections:');
    collections.forEach((collection) => console.log('-', collection.id));
  })
  .catch((error) => {
    console.error('Error listing collections:', error.code, error.message);

    // Additional debug information
    console.log('\nDebug Info:');
    console.log('- Project ID:', serviceAccount.project_id);
    console.log('- Client Email:', serviceAccount.client_email);
    console.log('- Database URL:', process.env.FIREBASE_DATABASE_URL || 'Not set in env');

    // Try a direct API call
    console.log('\nTrying direct API call...');
    return db
      .collection('test')
      .doc('test')
      .get()
      .then((doc) => {
        console.log('Document data:', doc.data());
      })
      .catch((err) => {
        console.error('Direct API call failed:', err.code, err.message);
      });
  });
