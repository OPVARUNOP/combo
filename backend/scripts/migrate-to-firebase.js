#!/usr/bin/env node
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-key.json');
const mongoose = require('mongoose');
const { User, Music, Playlist, Album, Artist } = require('../src/models');
const logger = require('../src/config/logger');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/combo';

async function migrateUsers() {
  logger.info('Starting user migration...');
  const users = await User.find({});

  for (const user of users) {
    try {
      // Create Firebase Auth user
      await admin.auth().createUser({
        uid: user._id.toString(),
        email: user.email,
        emailVerified: user.isEmailVerified,
        password: user.password,
        displayName: user.name,
        disabled: !user.isActive,
      });

      // Create Firestore user document
      await db
        .collection('users')
        .doc(user._id.toString())
        .set({
          email: user.email,
          name: user.name,
          role: user.role || 'user',
          status: user.isActive ? 'active' : 'inactive',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });

      logger.info(`Migrated user: ${user.email}`);
    } catch (error) {
      logger.error(`Error migrating user ${user.email}:`, error.message);
    }
  }
  logger.info('User migration completed');
}

async function migrateCollection(collectionName, Model, transformFn) {
  logger.info(`Starting ${collectionName} migration...`);
  const items = await Model.find({});
  const batch = db.batch();
  let count = 0;

  for (const item of items) {
    try {
      const docRef = db.collection(collectionName).doc(item._id.toString());
      batch.set(docRef, transformFn(item));
      count++;

      // Commit batch every 500 documents
      if (count % 500 === 0) {
        await batch.commit();
        logger.info(`Committed batch of 500 ${collectionName}`);
      }
    } catch (error) {
      logger.error(`Error migrating ${collectionName} ${item._id}:`, error.message);
    }
  }

  // Commit any remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }

  logger.info(`Migrated ${count} ${collectionName} documents`);
}

async function migrateAll() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');

    // Run migrations
    await migrateUsers();

    await migrateCollection('music', Music, (item) => ({
      title: item.title,
      artist: item.artist,
      album: item.album,
      duration: item.duration,
      url: item.url,
      coverImage: item.coverImage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    await migrateCollection('playlists', Playlist, (item) => ({
      name: item.name,
      description: item.description,
      userId: item.userId,
      tracks: item.tracks,
      isPublic: item.isPublic,
      coverImage: item.coverImage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    await migrateCollection('albums', Album, (item) => ({
      title: item.title,
      artist: item.artist,
      year: item.year,
      coverImage: item.coverImage,
      tracks: item.tracks,
      genre: item.genre,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    await migrateCollection('artists', Artist, (item) => ({
      name: item.name,
      bio: item.bio,
      image: item.image,
      genres: item.genres,
      socialLinks: item.socialLinks,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    logger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
migrateAll();
