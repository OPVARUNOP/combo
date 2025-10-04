const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

async function checkFirestore() {
  try {
    // Initialize with just the service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'combo-624e1',
    });

    console.log('✅ Firebase Admin initialized');

    // Get Firestore instance
    const firestore = admin.firestore();

    // Try to get a non-existent document
    console.log('🔍 Checking Firestore access...');
    const doc = await firestore.collection('test').doc('connection').get();

    if (!doc.exists) {
      console.log('✅ Firestore is accessible!');
      console.log('\nNext steps:');
      console.log('1. Your Firestore is working correctly');
      console.log('2. You can now proceed with your application setup');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.code || 'Unknown error');
    console.error('Message:', error.message);

    if (error.code === 5 || error.code === '5' || error.message.includes('NOT_FOUND')) {
      console.log('\nℹ️  Firestore is not properly set up. Please:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your project (combo-624e1)');
      console.log('3. Click on "Firestore Database" in the left menu');
      console.log('4. Click "Create database" and follow the setup wizard');
      console.log('5. Choose a location (e.g., us-central1)');
      console.log('6. Choose "Start in production mode"');
    }

    process.exit(1);
  }
}

checkFirestore();
