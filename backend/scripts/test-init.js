const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if service account exists
const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-service-account.json not found in config/ directory');
  console.log('\nPlease follow these steps to set up Firebase:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log(`5. Save the file as 'config/firebase-service-account.json' in your project`);
  process.exit(1);
}

console.log('✅ Found firebase-service-account.json');

// Try to initialize Firebase
console.log('\n🔧 Initializing Firebase Admin SDK...');

try {
  const serviceAccount = require(serviceAccountPath);

  // Verify required fields
  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Invalid service account file. Missing required fields.');
  }

  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
    storageBucket: 'combo-624e1.appspot.com',
  });

  console.log('✅ Firebase Admin SDK initialized successfully!');

  // Test Firestore
  console.log('\n🔍 Testing Firestore...');
  admin.firestore();
  console.log('✅ Firestore initialized');

  // Test Realtime Database
  console.log('\n🔍 Testing Realtime Database...');
  admin.database();
  console.log('✅ Realtime Database initialized');

  // Test Auth
  console.log('\n🔍 Testing Authentication...');
  admin.auth();
  console.log('✅ Authentication initialized');

  // Test Storage
  console.log('\n🔍 Testing Storage...');
  admin.storage();
  console.log('✅ Storage initialized');

  console.log('\n🎉 All Firebase services initialized successfully!');
} catch (error) {
  console.error('\n❌ Error initializing Firebase Admin SDK:');
  console.error(error.message);

  if (error.code === 'app/duplicate-app') {
    console.log('\n⚠️  Firebase app already initialized. Using existing instance.');
  } else if (error.code === 'app/no-app') {
    console.log('\n⚠️  Firebase app not initialized. Make sure to call initializeApp() first.');
  } else if (error.code === 'auth/invalid-credential') {
    console.log('\n⚠️  Invalid credentials. Please check your service account file.');
    console.log('   Make sure the private_key and client_email are correct.');
  }

  process.exit(1);
}
