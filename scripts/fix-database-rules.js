#!/usr/bin/env node

/**
 * Firebase Database Rules Fixer
 *
 * This script updates Firebase Realtime Database rules to include
 * the necessary indexes for user authentication and queries.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIREBASE_CONFIG = {
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  databaseSecret: process.env.FIREBASE_DATABASE_SECRET || 'mqucsRC7MHfDLdYSbNTU1srwlK4l6RsOtKKgqB4m'
};

// Firebase Realtime Database Rules with proper indexes
const DATABASE_RULES = {
  "rules": {
    "users": {
      ".indexOn": ["email", "name", "createdAt"],
      "$user_id": {
        ".read": "auth != null && (auth.uid == $user_id || auth.token.admin == true)",
        ".write": "auth != null && (auth.uid == $user_id || auth.token.admin == true)"
      }
    },
    "songs": {
      ".indexOn": ["title", "artist", "genre", "createdBy", "createdAt"],
      "$song_id": {
        ".read": "true",
        ".write": "auth != null && (auth.token.admin == true || data.child('createdBy').val() == auth.uid)"
      }
    },
    "playlists": {
      ".indexOn": ["name", "createdBy", "isPublic", "createdAt"],
      "$playlist_id": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.token.admin == true || data.child('createdBy').val() == auth.uid)"
      }
    },
    "tokens": {
      ".indexOn": ["expiresAt"],
      "$token_id": {
        ".read": "false",
        ".write": "true"
      }
    },
    "tokenBlacklist": {
      ".indexOn": ["expiresAt"],
      "$token_id": {
        ".read": "false",
        ".write": "true"
      }
    },
    "health": {
      ".read": "true",
      ".write": "true"
    },
    ".read": "false",
    ".write": "false"
  }
};

async function updateDatabaseRules() {
  console.log('🔧 Updating Firebase Realtime Database rules...');

  try {
    const response = await axios.put(
      `${FIREBASE_CONFIG.databaseURL}/.settings/rules.json?auth=${FIREBASE_CONFIG.databaseSecret}`,
      DATABASE_RULES,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log('✅ Database rules updated successfully!');
      console.log('📋 New rules include indexes for:');
      console.log('   - users: email, name, createdAt');
      console.log('   - songs: title, artist, genre, createdBy, createdAt');
      console.log('   - playlists: name, createdBy, isPublic, createdAt');
      console.log('   - tokens: expiresAt');
      console.log('   - tokenBlacklist: expiresAt');
      return true;
    } else {
      console.error('❌ Failed to update database rules:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating database rules:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  try {
    const response = await axios.get(
      `${FIREBASE_CONFIG.databaseURL}/health.json?auth=${FIREBASE_CONFIG.databaseSecret}`
    );

    if (response.status === 200) {
      console.log('✅ Database connection successful!');
      return true;
    } else {
      console.error('❌ Database connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Firebase Database Rules Fixer');
  console.log('================================\n');

  // Test connection first
  const connected = await testDatabaseConnection();
  if (!connected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }

  // Update rules
  const updated = await updateDatabaseRules();
  if (!updated) {
    console.error('❌ Failed to update database rules');
    process.exit(1);
  }

  console.log('\n🎉 Database rules updated successfully!');
  console.log('💡 Your API should now work properly for user registration and queries.');
  console.log('\n📝 Note: It may take a few minutes for the new rules to propagate.');
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}
