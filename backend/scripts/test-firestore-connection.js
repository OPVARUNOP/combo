const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

console.log('🔍 Testing Firestore connection...');

async function testConnection() {
  try {
    console.log('1. Initializing Firebase Admin...');

    // Initialize with explicit project ID and database URL
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        projectId: 'combo-624e1',
        databaseURL: 'https://combo-624e1.firebaseio.com',
      },
      'connection-test-' + Date.now()
    );

    console.log('✅ Firebase Admin initialized');
    console.log('   Project ID:', app.options.projectId);

    // Get Firestore instance
    console.log('\n2. Getting Firestore instance...');
    const firestore = app.firestore();

    // Enable offline persistence for better error messages
    firestore.settings({
      ignoreUndefinedProperties: true,
    });

    // Test a simple operation
    console.log('3. Testing Firestore operation...');
    const testDoc = firestore.collection('test-connection').doc('test-' + Date.now());

    console.log('   Writing test document...');
    await testDoc.set({
      message: 'Test connection',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Successfully wrote to Firestore');

    // Try to read it back
    console.log('\n4. Reading test document...');
    const doc = await testDoc.get();

    if (doc.exists) {
      console.log('✅ Successfully read from Firestore');
      console.log('   Document data:', doc.data());
    } else {
      console.log('⚠️  Document not found after write');
    }

    // Clean up
    console.log('\n5. Cleaning up test document...');
    await testDoc.delete();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.code || 'Unknown error');
    console.error('Message:', error.message);

    if (error.code === 5 || error.code === '5' || error.message.includes('NOT_FOUND')) {
      console.log('\n🔴 Firestore is not accessible. Please verify:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your project (combo-624e1)');
      console.log('3. In the left menu, click on "Firestore Database"');
      console.log('4. Make sure you see your database in the "Data" tab');
      console.log(
        '5. Check that your service account has the "Cloud Datastore User" role in Google Cloud Console'
      );
    }

    // Print full error for debugging
    console.log('\n🔍 Full error details:');
    console.error(error);

    process.exit(1);
  }
}

testConnection();
