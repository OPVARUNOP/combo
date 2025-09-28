// Test Firebase Admin SDK integration
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// This will use the same initialization as server.js
require('./server');

const testFirebase = async () => {
  try {
    console.log('🚀 Testing Firebase Admin SDK...');

    // 1. Test Firestore
    console.log('\n🔍 Testing Firestore...');
    const db = admin.firestore();
    const testDoc = db.collection('test').doc('connection-test');
    
    // Write a test document
    await testDoc.set({
      testId: uuidv4(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Firebase connection test',
      status: 'success'
    });
    console.log('✅ Successfully wrote to Firestore');

    // Read the test document
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Successfully read from Firestore:', doc.data());
    } else {
      console.log('❌ Document not found');
    }

    // 2. Test Authentication
    console.log('\n🔑 Testing Authentication...');
    const auth = admin.auth();
    const users = await auth.listUsers(1);
    console.log(`✅ Successfully connected to Firebase Auth. Found ${users.users.length} users`);

    // 3. Test Realtime Database if configured
    try {
      const database = admin.database();
      const ref = database.ref('connection-test');
      await ref.set({
        timestamp: Date.now(),
        status: 'success'
      });
      console.log('✅ Successfully wrote to Realtime Database');
    } catch (error) {
      console.log('ℹ️ Realtime Database not configured or not needed');
    }

    console.log('\n🎉 All Firebase tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    process.exit(1);
  }
};

testFirebase();
