const admin = require('firebase-admin');
const path = require('path');
const config = require('../config/config');
const logger = require('../src/config/logger');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../config/firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.databaseURL,
  storageBucket: config.firebase.storageBucket,
});

async function testAdmin() {
  try {
    logger.info('Testing Firebase Admin...');

    // List users (first 10)
    const listUsersResult = await admin.auth().listUsers(5);
    logger.info('Successfully connected to Firebase Auth');

    if (listUsersResult.users.length > 0) {
      logger.info('First 5 users:');
      listUsersResult.users.forEach((user) => {
        console.log(`- ${user.email} (${user.uid})`);
      });
    } else {
      logger.info('No users found in the project');
    }

    // Test Firestore
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection-test').get();

    if (testDoc.exists) {
      logger.info('Firestore connection successful');
      logger.info('Test document:', testDoc.data());
    } else {
      logger.info('Firestore connection successful, but test document does not exist');
    }

    logger.info('✅ Firebase Admin test completed successfully');
  } catch (error) {
    logger.error('❌ Firebase Admin test failed:', error);
    process.exit(1);
  }
}

testAdmin();
