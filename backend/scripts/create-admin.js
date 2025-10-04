#!/usr/bin/env node
require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`\n${colors.green}✅ ${msg}${colors.reset}\n`),
  error: (msg) => console.error(`\n${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
};

function askQuestion(question, defaultAnswer = '') {
  return new Promise((resolve) => {
    rl.question(
      `${colors.cyan}${question}${defaultAnswer ? ` [${defaultAnswer}]` : ''}: `,
      (answer) => {
        resolve(answer || defaultAnswer);
      }
    );
  });
}

async function createAdminUser() {
  try {
    log.info('\n=== Creating Admin User ===');

    const email = await askQuestion('Enter admin email', 'admin@example.com');
    const password = await askQuestion('Enter admin password', 'admin123');
    const username = await askQuestion('Enter admin username', 'admin');

    // Validate email format
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    log.info('Creating admin user...');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      emailVerified: true,
      disabled: false,
    });

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      admin: true,
    });

    // Hash password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document in Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(userRecord.uid)
      .set({
        id: userRecord.uid,
        email,
        username,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        status: 'active',
        avatar: 'https://via.placeholder.com/150',
        preferences: { theme: 'dark', notifications: true },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    log.success('🎉 Admin user created successfully!');
    log.info('\nAdmin User Details:');
    log.info(`User ID: ${userRecord.uid}`);
    log.info(`Email: ${email}`);
    log.info(`Password: ${'*'.repeat(password.length)}`);
    log.info(`Role: admin`);

    log.info('\nYou can now log in to the admin dashboard with these credentials.');
    log.info('\n⚠️  IMPORTANT: Change the default password after first login!');
  } catch (error) {
    log.error(`Failed to create admin user: ${error.message}`);
    if (error.code === 'auth/email-already-exists') {
      log.error('An admin user with this email already exists.');
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the admin user creation
createAdminUser();
