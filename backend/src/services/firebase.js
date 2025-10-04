const admin = require('firebase-admin');
const logger = require('../config/logger');

let isInitialized = false;
let db = null;
let auth = null;

/**
 * Initialize Firebase Admin SDK with the provided configuration
 */
async function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    let firebaseConfig = {};

    // For development, use database secret if no service account is provided
    if (process.env.FIREBASE_DATABASE_SECRET) {
      firebaseConfig = {
        credential: admin.credential.cert({
          projectId: 'combo-music-app',
          clientEmail: 'firebase-adminsdk@combo-music-app.iam.gserviceaccount.com',
          privateKey: process.env.FIREBASE_DATABASE_SECRET.replace(/\\\\n/g, '\\n'),
        }),
        databaseURL: 'https://combo-music-app-default-rtdb.firebaseio.com',
        storageBucket: 'combo-music-app.appspot.com',
      };
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      // For production with service account
      firebaseConfig = {
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      };
    } else {
      throw new Error(
        'Missing Firebase configuration. Please set up the required environment variables.'
      );
    }

    // Initialize the app
    const app = admin.initializeApp(firebaseConfig);

    // Initialize services
    db = admin.firestore();
    auth = admin.auth();

    // Verify Firestore connection
    await db.listCollections();

    isInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Failed to initialize Firebase: ${error.message}`);
    } else {
      logger.warn('Running without Firebase. Some features may not work.');
      return null;
    }
  }
}

// Initialize Firebase when this module is loaded
initializeFirebase().catch((error) => {
  logger.error('Failed to initialize Firebase:', error);
});

module.exports = {
  admin: isInitialized ? admin : null,
  db,
  auth,
  isFirebaseInitialized: isInitialized,
  initializeFirebase, // Export for manual initialization if needed
};
