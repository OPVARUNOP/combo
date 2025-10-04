#!/usr/bin/env node
const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-key.json');
const logger = require('../src/config/logger');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// Firestore security rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users, write access to authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.token.email_verified == true &&
        request.auth.token.email.matches('.*@[^.]*\\.com$'));
    }

    // User-specific access control
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
        (request.auth.token.email_verified == true &&
         request.auth.token.email.matches('.*@[^.]*\\.com$'));
    }

    // Playlist access control
    match /playlists/{playlistId} {
      allow read: if resource.data.isPublic == true ||
        request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}`;

// Create Firestore indexes
async function createIndexes() {
  logger.info('Creating Firestore indexes...');

  try {
    // Note: In production, you would use the Firebase CLI to deploy indexes
    // This is just for reference and would need to be set up in the Firebase Console
    logger.info(
      'Firestore indexes should be created in the Firebase Console or using the Firebase CLI.'
    );
    logger.info('Please run: firebase firestore:indexes');

    // Deploy security rules
    await admin.securityRules().releaseFirestoreRulesetFromSource(firestoreRules);
    logger.info('Firestore security rules updated successfully');
  } catch (error) {
    logger.error('Error setting up Firestore:', error);
    throw error;
  }
}

// Initialize default admin user
async function createDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn(
      'DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set. Skipping default admin creation.'
    );
    return;
  }

  try {
    // Check if admin user already exists
    try {
      await admin.auth().getUserByEmail(email);
      logger.info(`Admin user ${email} already exists`);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') throw error;
    }

    // Create admin user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
      displayName: 'Admin User',
    });

    // Set custom claims for admin access
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    // Create user document in Firestore
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        name: 'Admin User',
        roles: ['admin'],
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    logger.info(`Created admin user: ${email}`);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  }
}

// Run setup
async function setupFirebase() {
  try {
    await createIndexes();
    await createDefaultAdmin();
    logger.info('Firebase setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Firebase setup failed:', error);
    process.exit(1);
  }
}

setupFirebase();
