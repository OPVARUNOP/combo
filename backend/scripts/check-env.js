// Test script to check environment variables
require('dotenv').config();

console.log('Checking environment variables...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
console.log(
  'FIREBASE_PRIVATE_KEY length:',
  process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0
);
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL || 'Not set');
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || 'Not set');

// Try to initialize Firebase
console.log('\nAttempting to initialize Firebase...');
try {
  const admin = require('firebase-admin');

  // Log the private key for debugging (first and last 20 chars only)
  const pk = process.env.FIREBASE_PRIVATE_KEY || '';
  console.log('Private key sample:', pk.substring(0, 20) + '...' + pk.substring(pk.length - 20));

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  console.log('Firebase initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('Failed to initialize Firebase:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}
