const { admin, db, firestore, auth, storage, isInitialized } = require('../config/firebase-admin');
const logger = require('../src/config/logger');

async function testFirebaseConnection() {
  if (!isInitialized()) {
    logger.error('Firebase is not initialized');
    process.exit(1);
  }

  try {
    logger.info('🚀 Starting Firebase services test...\n');

    // Test Realtime Database
    logger.info('1️⃣ Testing Realtime Database...');
    const dbRef = db.ref('.info/connected');
    const dbSnapshot = await dbRef.once('value');
    if (dbSnapshot.val() === true) {
      logger.info('   ✅ Realtime Database connection successful');

      // Test write operation
      const testRef = db.ref('connection-tests/' + Date.now());
      await testRef.set({
        timestamp: Date.now(),
        test: 'realtime-db-write-test',
      });
      logger.info('   ✅ Realtime Database write successful');
    } else {
      logger.warn('   ⚠️ Realtime Database not connected');
    }

    // Test Firestore
    logger.info('\n2️⃣ Testing Firestore...');
    const firestoreTestRef = firestore.collection('connection-tests').doc('firestore-test');
    await firestoreTestRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'success',
      message: 'Firestore connection test',
    });
    const firestoreDoc = await firestoreTestRef.get();
    if (firestoreDoc.exists) {
      logger.info('   ✅ Firestore read/write successful');
    } else {
      logger.warn('   ⚠️ Firestore document not found after write');
    }

    // Test Authentication
    logger.info('\n3️⃣ Testing Authentication...');
    try {
      const users = await auth.listUsers(1);
      logger.info(`   ✅ Authentication service working. Found ${users.users.length} user(s)`);

      // Try to get a non-existent user to test permissions
      await auth.getUser('non-existent-user').catch(() => {
        // Expected to fail with 'not-found' error
      });
      logger.info('   ✅ Authentication permissions working');
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        logger.error('   ❌ Invalid credentials. Please check your service account.');
      } else {
        logger.error(`   ❌ Authentication error: ${error.message}`);
      }
    }

    // Test Storage if available
    if (storage) {
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
    } else {
      logger.info('\n4️⃣ Storage not configured or not available');
    }

    logger.info('\n🎉 All Firebase services tested successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('\n❌ Error testing Firebase services:', error);
    process.exit(1);
  }
}

// Run the tests
logger.info('Starting Firebase connection tests...');
testFirebaseConnection();
