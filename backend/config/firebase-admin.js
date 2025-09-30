const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Default Firebase configuration
const FIREBASE_CONFIG = {
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'combo-backend-service',
    // Add any additional claims here if needed
  }
};

// Initialize Firebase Admin
let firebaseApp;

try {
  // First, try to initialize with environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        ...FIREBASE_CONFIG
      });
      console.log('Firebase Admin initialized with environment variables');
    } catch (error) {
      console.error('Failed to initialize with FIREBASE_SERVICE_ACCOUNT:', error.message);
    }
  }
  
  // If not initialized yet, try to load from service account file
  if (!firebaseApp) {
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = require(serviceAccountPath);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          ...FIREBASE_CONFIG
        });
        console.log('Firebase Admin initialized with service account file');
      } catch (error) {
        console.error('Failed to initialize with service account file:', error.message);
      }
    }
  }
  
  // If still not initialized, try with database secret
  if (!firebaseApp && process.env.FIREBASE_DATABASE_SECRET) {
    try {
      firebaseApp = admin.initializeApp({
        databaseURL: FIREBASE_CONFIG.databaseURL,
        databaseAuthVariableOverride: FIREBASE_CONFIG.databaseAuthVariableOverride,
        serviceAccountId: 'firebase-adminsdk',
        projectId: 'combo-624e1',
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase Admin initialized with database secret');
    } catch (error) {
      console.error('Failed to initialize with database secret:', error.message);
    }
  }
  
  // If all else fails, initialize a default app (useful for development with emulators)
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      ...FIREBASE_CONFIG,
      // This will only work with the database emulator
      credential: admin.credential.applicationDefault()
    });
    console.warn('Firebase Admin initialized with default configuration (limited functionality)');
  }
  
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

// Export initialized services
module.exports = {
  auth: firebaseApp.auth(),
  firestore: firebaseApp.firestore(),
  database: firebaseApp.database(),
  admin: firebaseApp,
  isInitialized: !!firebaseApp
};
