const { admin, db, firestore, auth, storage, isInitialized } = require('../config/firebase-admin');
const logger = require('../src/config/logger');

async function testConnection() {
  if (!isInitialized()) {
    logger.error('Firebase is not properly initialized');
    process.exit(1);
  }

  try {
    logger.info('🚀 Testing Firebase connection...\n');

    // Test Firestore
    logger.info('1️⃣ Testing Firestore...');
    try {
      const testDoc = firestore.collection('connection-tests').doc('test');
      await testDoc.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: 'Connection test',
        status: 'success',
      });
      const doc = await testDoc.get();
      if (doc.exists) {
        logger.info('   ✅ Firestore connection successful');
      } else {
        logger.error('   ❌ Firestore document not found after write');
      }
    } catch (error) {
      logger.error(`   ❌ Firestore error: ${error.message}`);
    }

    // Test Realtime Database
    logger.info('\n2️⃣ Testing Realtime Database...');
    try {
      const dbRef = db.ref('connection-tests/test');
      await dbRef.set({
        timestamp: Date.now(),
        status: 'success',
      });
      const snapshot = await dbRef.once('value');
      if (snapshot.val()) {
        logger.info('   ✅ Realtime Database connection successful');
      } else {
        logger.error('   ❌ Realtime Database write/read failed');
      }
    } catch (error) {
      logger.error(`   ❌ Realtime Database error: ${error.message}`);
    }

    // Test Authentication
    logger.info('\n3️⃣ Testing Authentication...');
    try {
      const users = await auth.listUsers(1);
      logger.info(`   ✅ Authentication successful. Found ${users.users.length} user(s)`);
    } catch (error) {
      logger.error(`   ❌ Authentication failed: ${error.message}`);
    }

    // Test Storage if available
    logger.info('\n4️⃣ Testing Storage...');
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ maxResults: 1 });
      logger.info(`   ✅ Storage connection successful. Found ${files.length} file(s)`);

      // Test file upload
      const testFileName = `test-${Date.now()}.txt`;
      const file = bucket.file(testFileName);
      await file.save('Test file content', {
        metadata: { contentType: 'text/plain' },
      });
      logger.info(`   ✅ Storage file upload successful: ${testFileName}`);

      // Clean up test file
      await file.delete();
      logger.info('   ✅ Storage test file cleaned up');
    } catch (error) {
      logger.error(`   ❌ Storage error: ${error.message}`);
    }

    logger.info('\n🎉 All tests completed!');
    process.exit(0);
  } catch (error) {
    logger.error('\n❌ Error during connection tests:', error);
    process.exit(1);
  }
}

// Run the tests
testConnection();
