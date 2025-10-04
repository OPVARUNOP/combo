require('dotenv').config();

console.log('🔍 Starting Firebase Admin verification...');
console.log(
  `🔑 Using service account: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'Not set, using default path'}`
);

// Import the simplified Firebase Admin configuration
const { adminAuth, adminFirestore, adminStorage } = require('../config/firebase-admin-simple');

async function verifyFirebaseAdmin() {
  try {
    console.log('\n🔑 Testing Firebase Authentication...');

    // Test Authentication
    const auth = adminAuth;
    const users = await auth.listUsers(1);
    console.log('✅ Successfully connected to Firebase Auth');
    console.log(`   - Total users: ${users.users.length}`);

    // Test Firestore
    console.log('\n📝 Testing Firestore...');
    const db = adminFirestore;
    const testDocRef = db.collection('test_connection').doc('test_doc');

    // Write test data
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Test connection successful',
      environment: process.env.NODE_ENV || 'development',
    };

    await testDocRef.set(testData);
    console.log('✅ Successfully wrote test document to Firestore');

    // Read back the document
    const doc = await testDocRef.get();
    if (doc.exists) {
      console.log('✅ Successfully read test document from Firestore');
      console.log('   - Document data:', JSON.stringify(doc.data(), null, 2));
    } else {
      console.log('⚠️  Test document not found after writing');
    }

    // Test Storage (just check if the bucket is accessible)
    console.log('\n📦 Testing Storage...');
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles({
      maxResults: 1,
      autoPaginate: false,
    });
    console.log(`✅ Successfully connected to Storage (${files.length} files found in root)`);

    console.log('\n🎉 Firebase Admin SDK is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error verifying Firebase Admin:');

    if (error.code === 'app/no-app') {
      console.error('   - No Firebase app has been initialized');
      console.error('   - Check if the service account file exists and is valid');
      console.error(`   - Path: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'Not set'}`);
    } else if (error.code === 'app/invalid-credential') {
      console.error('   - Invalid service account credentials');
      console.error('   - Verify the service account file has the correct permissions');
    } else if (error.code === 'app/network-error') {
      console.error('   - Network error connecting to Firebase');
      console.error('   - Check your internet connection and try again');
    } else {
      console.error('   - Error details:', error.message);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack.split('\n').slice(0, 5).join('\n'));
      }
    }

    process.exit(1);
  }
}

// Run the verification
verifyFirebaseAdmin();
