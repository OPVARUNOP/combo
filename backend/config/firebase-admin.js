const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const { auth } = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const logger = require('../src/config/logger');

// Firebase configuration
const FIREBASE_CONFIG = {
  projectId: 'combo-624e1',
  databaseURL:
    process.env.FIREBASE_DATABASE_URL || 'https://combo-624e1-default-rtdb.firebaseio.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'combo-624e1.appspot.com',
  firestore: {
    databaseId: 'combodatabase', // The database ID we found
  },
};

let firebaseInitialized = false;
let serviceAccount = null;

// Initialize Firebase services
const initializeFirebase = () => {
  if (firebaseInitialized) {
    return true;
  }

  try {
    // Try to load service account from file
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);

      // Verify service account has required fields
      if (!serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error(
          'Invalid service account file. Please generate a new one from Firebase Console.'
        );
      }
    }
    // Try environment variables as fallback
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (error) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
        throw new Error(
          'Invalid FIREBASE_SERVICE_ACCOUNT environment variable. Must be a valid JSON string.'
        );
      }
    } else {
      throw new Error(
        'No valid Firebase configuration found. Please set up firebase-service-account.json or FIREBASE_SERVICE_ACCOUNT environment variable.'
      );
    }

    firebaseInitialized = true;
    return true;
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    firebaseInitialized = false;
    return false;
  }
};

// Initialize Firebase
initializeFirebase();

// Initialize Firestore with the correct database ID
const getFirestore = () => {
  if (!firebaseInitialized && !initializeFirebase()) {
    throw new Error('Firebase not initialized');
  }

  return new Firestore({
    projectId: FIREBASE_CONFIG.projectId,
    databaseId: FIREBASE_CONFIG.firestore.databaseId,
    credentials: serviceAccount,
  });
};

// Initialize Storage
const getStorage = () => {
  if (!firebaseInitialized && !initializeFirebase()) {
    throw new Error('Firebase not initialized');
  }

  return new Storage({
    projectId: FIREBASE_CONFIG.projectId,
    credentials: serviceAccount,
  });
};

// Initialize Auth
const getAuth = () => {
  if (!firebaseInitialized && !initializeFirebase()) {
    throw new Error('Firebase not initialized');
  }

  return auth();
};

// Export the initialized services
module.exports = {
  // Core services
  firestore: getFirestore(),
  storage: getStorage(),
  auth: getAuth(),

  // Helper methods
  isInitialized: () => firebaseInitialized,
  getFirestore,
  getStorage,
  getAuth,

  // Configuration
  config: FIREBASE_CONFIG,
};
