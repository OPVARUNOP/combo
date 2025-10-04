const path = require('path');
const fs = require('fs');
const { Firestore } = require('@google-cloud/firestore');

async function testFirestoreService() {
  try {
    console.log('🔍 Loading service account...');

    // Load service account
    const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Firebase service account file not found at ' + serviceAccountPath);
    }

    const serviceAccount = require(serviceAccountPath);
    console.log('✅ Service account loaded');

    // Initialize Firestore
    console.log('\n🚀 Initializing Firestore...');
    const firestore = new Firestore({
      projectId: serviceAccount.project_id,
      databaseId: 'combodatabase',
      credentials: serviceAccount,
    });

    console.log('✅ Firestore initialized');

    // Test write
    console.log('\n✏️  Testing write operation...');
    const testDoc = firestore.collection('test').doc('connection-test');
    await testDoc.set({
      message: 'Firestore service test',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
    console.log('✅ Document written successfully');

    // Test read
    console.log('\n📖 Testing read operation...');
    const doc = await testDoc.get();
    if (!doc.exists) {
      throw new Error('Document not found after write');
    }
    console.log('✅ Document read successfully:', doc.data());

    // Clean up
    console.log('\n🧹 Cleaning up test document...');
    await testDoc.delete();
    console.log('✅ Test document deleted');

    console.log('\n🎉 Firestore service test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testFirestoreService();
