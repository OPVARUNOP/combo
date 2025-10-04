const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

async function testFirebase() {
  try {
    // Delete any existing Firebase apps
    if (admin.apps.length > 0) {
      admin.apps.forEach((app) => app.delete());
    }

    console.log('Initializing Firebase...');

    // Initialize with explicit project ID and database URL
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        projectId: 'combo-624e1',
        databaseURL: 'https://combo-624e1.firebaseio.com',
      },
      'test-app'
    );

    console.log('✅ Firebase app initialized successfully');
    console.log('App name:', app.name);
    console.log('Project ID:', app.options.projectId);

    // Test Firestore
    console.log('\n🔍 Testing Firestore...');
    const firestore = app.firestore();

    // Try to list collections
    const collections = await firestore.listCollections();
    console.log('✅ Firestore connection successful');
    console.log(
      'Collections:',
      collections.map((c) => c.id)
    );

    // Test a simple write/read
    console.log('\n✏️  Testing write/read...');
    const testDoc = firestore.collection('test-collection').doc('test-doc');
    await testDoc.set({
      message: 'Test document',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Document written successfully');

    const doc = await testDoc.get();
    console.log('✅ Document read successfully:', doc.data());

    // Clean up
    await testDoc.delete();
    console.log('✅ Test document cleaned up');
  } catch (error) {
    console.error('\n❌ Error:', error.code || 'Unknown error');
    console.error('Message:', error.message);

    if (error.code === 'app/duplicate-app') {
      console.log(
        '\nℹ️  Try running this script again. The duplicate app error should be resolved now.'
      );
    } else if (error.code === 5 || error.code === '5' || error.message.includes('NOT_FOUND')) {
      console.log('\nℹ️  Firestore not found. Please verify:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your project (combo-624e1)');
      console.log('3. Click on "Firestore Database" in the left menu');
      console.log('4. If you see "Create database" button, click it and follow the setup wizard');
      console.log('5. Choose a location close to your users (e.g., us-central1)');
      console.log('6. Choose "Start in production mode" for now');
      console.log('\nAfter completing these steps, run this test again.');
    }

    process.exit(1);
  }
}

// Run the test
testFirebase();
