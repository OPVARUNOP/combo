require('dotenv').config();
const admin = require('firebase-admin');

console.log('Testing Firebase initialization...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
console.log(
  'FIREBASE_PRIVATE_KEY length:',
  process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.length + ' characters'
    : 'Not set'
);
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL || 'Not set');

// Handle private key formatting
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Remove surrounding quotes if present
  privateKey = privateKey.replace(/^['"](.*)['"]$/, '$1');
  // Replace escaped newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
}

console.log(
  '\nPrivate key starts with:',
  privateKey ? privateKey.substring(0, 30) + '...' : 'Not set'
);

// Try to initialize Firebase
console.log('\nInitializing Firebase...');
try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log('✅ Firebase initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  process.exit(1);
}
