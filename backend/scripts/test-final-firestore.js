const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../config/firebase-service-account.json');

async function testFirestore() {
  try {
    console.log('🚀 Testing Firestore connection...');

    // Initialize with explicit database ID
    const firestore = new Firestore({
      projectId: 'combo-624e1',
      databaseId: 'combodatabase', // Use the actual database ID
      credentials: serviceAccount,
    });

    console.log('✅ Firestore client initialized');
    console.log('Database ID:', firestore.databaseId);

    // Test a simple write operation
    console.log('\n✏️  Testing write operation...');
    const docRef = firestore.collection('test-collection').doc('test-doc');

    await docRef.set({
      message: 'Hello from Firestore!',
      timestamp: Firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Document written successfully');

    // Test read operation
    console.log('\n📖 Testing read operation...');
    const doc = await docRef.get();

    if (doc.exists) {
      console.log('✅ Document read successfully:');
      console.log(doc.data());
    } else {
      console.log('❌ Document not found after write');
    }

    // Clean up
    console.log('\n🧹 Cleaning up test document...');
    await docRef.delete();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);

    if (error.details) {
      console.error('Details:', error.details);
    }

    process.exit(1);
  }
}

testFirestore();
