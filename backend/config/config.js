const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Load Firebase service account
let serviceAccount = null;
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
  }
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 15,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES || 10,
    verifyEmailExpirationMinutes: process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES || 60 * 24, // 24 hours
  },

  // Firebase Configuration
  firebase: {
    projectId: serviceAccount?.project_id || process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    serviceAccount,
    firestore: {
      databaseId: 'combodatabase', // Your Firestore database ID
    },
  },

  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'],
  },

  // Backblaze B2 Configuration
  b2: {
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    bucketId: process.env.B2_BUCKET_ID,
    bucketName: process.env.B2_BUCKET_NAME,
    downloadUrl: process.env.B2_DOWNLOAD_URL,
  },
};
