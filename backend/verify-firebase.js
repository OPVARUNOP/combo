#!/usr/bin/env node

/**
 * Firebase Configuration Verifier
 *
 * This script helps verify your Firebase Admin SDK configuration
 * and tests the connection to Firebase services.
 */

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[i]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
};
async function verifyFirebase() {
  log.info('Starting Firebase configuration verification...');

  try {
    // Import the centralized Firebase admin configuration
    const { auth, firestore, database, isInitialized } = require('./config/firebase-admin');

    if (!isInitialized) {
      throw new Error(
        'Firebase Admin SDK failed to initialize. Check your service account configuration.'
      );
    }

    log.success('Firebase Admin SDK initialized successfully');

    // Test Firestore
    try {
      log.info('Testing Firestore connection...');
      const testDoc = firestore.collection('connection-tests').doc('verification');
      const testData = {
        timestamp: new Date().toISOString(),
        status: 'success',
        message: 'Firebase verification test',
      };

      await testDoc.set(testData);
      log.success('Successfully wrote to Firestore');

      const doc = await testDoc.get();
      if (doc.exists) {
        log.success('Successfully read from Firestore');
        log.info(`Document data: ${JSON.stringify(doc.data(), null, 2)}`);
      } else {
        log.warn('Document not found after write');
      }
    } catch (error) {
      log.error(`Firestore test failed: ${error.message}`);
      throw error;
    }

    // Test Auth
    try {
      log.info('Testing Auth service...');
      const users = await auth.listUsers(1);
      log.success(`Successfully connected to Firebase Auth (${users.users.length} users found)`);
    } catch (error) {
      log.error(`Auth test failed: ${error.message}`);
      throw error;
    }

    // Test Realtime Database if available
    if (database) {
      try {
        log.info('Testing Realtime Database connection...');
        const ref = database.ref('connection-tests/verification');
        await ref.set({
          timestamp: new Date().toISOString(),
          status: 'success',
        });
        log.success('Successfully wrote to Realtime Database');
      } catch (error) {
        log.warn(`Realtime Database test failed: ${error.message}`);
        // Don't fail the whole test for RTDB errors as it's optional
      }
    } else {
      log.warn('Realtime Database not configured');
    }

    log.success('\n✅ All Firebase services verified successfully!');
  } catch (error) {
    log.error(`Firebase verification failed: ${error.message}`);
    if (error.code) {
      log.error(`Error code: ${error.code}`);
    }
    if (error.stack) {
      log.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the verification
verifyFirebase().catch((error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
