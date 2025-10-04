const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
async function testFirestore() {
  try {
    console.log('🚀 Testing Firestore connection...');

    // Load service account
    const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);

    // Initialize Firestore
    const firestore = new Firestore({
      projectId: 'combo-624e1',
      databaseId: 'combodatabase',
      credentials: serviceAccount,
    });

    console.log('✅ Firestore initialized');

    // Test write
    console.log('\n✏️  Testing write operation...');
    const docRef = firestore.collection('test').doc('connection-test');
    await docRef.set({
      message: 'Test connection',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
    console.log('✅ Document written successfully');

    // Test read
    console.log('\n📖 Testing read operation...');
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error('Document not found after write');
    }
    console.log('✅ Document read successfully:', doc.data());

    // Test query
    console.log('\n🔍 Testing query operation...');
    const snapshot = await firestore
      .collection('test')
      .where('status', '==', 'success')
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('No documents found in query');
    }
    console.log('✅ Query successful. Found documents:', snapshot.size);

    // Clean up
    console.log('\n🧹 Cleaning up test document...');
    await docRef.delete();
    console.log('✅ Test document deleted');

    console.log('\n🎉 All Firestore tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
testFirestore();
