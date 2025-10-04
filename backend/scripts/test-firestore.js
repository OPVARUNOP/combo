const admin = require('firebase-admin');
// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  storageBucket: 'combo-624e1.appspot.com',
});

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');

    // Test a simple write and read operation
    const testDoc = db.collection('test').doc('connection');

    // Write a document
    await testDoc.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Testing Firestore connection',
      status: 'success',
    });

    console.log('✅ Successfully wrote to Firestore');

    // Read the document back
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Successfully read from Firestore');
      console.log('Document data:', doc.data());
    } else {
      console.log('❌ Document not found after write');
    }

    // Clean up
    await testDoc.delete();
    console.log('✅ Test document cleaned up');
  } catch (error) {
    console.error('❌ Firestore test failed:');
    console.error('Error code:', error.code);
    console.error('Error details:', error.details || error.message);

    if (error.code === 'app/no-app') {
      console.log(
        '\n⚠️  Firebase app not initialized. Check your service account and initialization.'
      );
    } else if (error.code === 7) {
      console.log('\n⚠️  Permission denied. Check your Firestore security rules.');
    } else if (error.code === 5) {
      console.log(
        '\n⚠️  Firestore not found. Make sure Firestore is enabled in your Firebase project.'
      );
      console.log('   Go to: https://console.firebase.google.com/project/combo-624e1/firestore');
    }

    process.exit(1);
  }
}

testFirestore();
