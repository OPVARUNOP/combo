const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to service account
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(process.env.HOME, '.config/combo/firebase-service-account.json');

// Check if service account exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Firebase service account not found at: ${serviceAccountPath}`);
  process.exit(1);
}

// Read and parse service account file
let serviceAccount;
try {
  const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountFile);

  console.log('ℹ️ Service account loaded successfully');
  console.log(`   - Project ID: ${serviceAccount.project_id}`);
  console.log(`   - Client Email: ${serviceAccount.client_email}`);

  // Ensure private key is properly formatted
  if (serviceAccount.private_key) {
    // Replace escaped newlines with actual newlines and trim any whitespace
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').trim();
    console.log('   - Private key format: Valid (newlines processed)');
  }
} catch (error) {
  console.error('❌ Error reading service account file:');
  console.error('   - Path:', serviceAccountPath);
  console.error('   - Error:', error.message);
  process.exit(1);
}

// Initialize Firebase
try {
  // Initialize the app with service account
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log(`   - Database URL: https://${serviceAccount.project_id}.firebaseio.com`);
  console.log(`   - Storage Bucket: ${serviceAccount.project_id}.appspot.com`);
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:');
  console.error('   - Error:', error.message);
  if (error.code) console.error('   - Code:', error.code);
  process.exit(1);
}

// Export services
const auth = admin.auth();
const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });
const storage = admin.storage();
const database = admin.database();

// Test the connection
(async () => {
  try {
    await auth.listUsers(1);
    console.log('✅ Successfully connected to Firebase Auth');
  } catch (error) {
    console.error('❌ Failed to connect to Firebase Auth:');
    console.error('   - Error:', error.message);
    if (error.code) console.error('   - Code:', error.code);
  }
})();

module.exports = {
  adminAuth: auth,
  adminFirestore: firestore,
  adminStorage: storage,
  adminDatabase: database,
  admin: admin,
};
