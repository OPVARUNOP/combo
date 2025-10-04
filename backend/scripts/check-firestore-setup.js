const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

async function checkFirestoreSetup() {
  try {
    // Initialize with minimal configuration
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'combo-624e1',
    });

    console.log('✅ Firebase Admin initialized');

    // Try to access Firestore
    const firestore = admin.firestore();

    // This will trigger a Firestore operation
    const databases = await firestore.listCollections();
    console.log('✅ Firestore is accessible!');
    console.log(
      'Collections:',
      databases.map((c) => c.id)
    );
  } catch (error) {
    console.error('\n❌ Error:', error.code || 'Unknown error');
    console.error('Message:', error.message);

    if (error.code === 5 || error.code === '5' || error.message.includes('NOT_FOUND')) {
      console.log('\n🔴 Firestore is not properly initialized. Please:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your project (combo-624e1)');
      console.log('3. In the left menu, click on "Firestore Database"');
      console.log('4. Click on the "Data" tab (not "Rules")');
      console.log('5. You should see a message about setting up Firestore');
      console.log('6. Click "Create database" and follow the setup wizard');
      console.log('7. Choose a location (e.g., us-central1)');
      console.log('8. Choose "Start in production mode"');
      console.log(
        '\n⚠️  Important: You need to complete the database creation wizard, not just set the rules.'
      );
    }

    process.exit(1);
  }
}

checkFirestoreSetup();
