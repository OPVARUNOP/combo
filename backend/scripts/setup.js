#!/usr/bin/env node
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`\n${colors.green}✅ ${msg}${colors.reset}\n`),
  error: (msg) => console.error(`\n${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.warn(`\n${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
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

function runCommand(command, options = {}) {
  try {
    const { cwd = process.cwd(), silent = false } = options;
    if (!silent) log.info(`Running: ${command}`);
    const output = execSync(command, { stdio: silent ? 'ignore' : 'inherit', cwd });
    return { success: true, output };
  } catch (error) {
    log.error(`Command failed: ${command}`);
    log.error(error.message);
    return { success: false, error };
  }
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    log.warn('.env file not found. Creating from .env.example...');
    try {
      const examplePath = path.join(__dirname, '../.env.example');
      if (!fs.existsSync(examplePath)) {
        throw new Error('.env.example file not found');
      }
      fs.copyFileSync(examplePath, envPath);
      log.success('.env file created from .env.example');
    } catch (error) {
      log.error('Failed to create .env file: ' + error.message);
      process.exit(1);
    }
  }

  // Reload env after creating the file
  require('dotenv').config({ path: envPath, override: true });

  return true;
}

async function installDependencies() {
  log.header('Installing Dependencies');

  // Install Node.js dependencies
  await runCommand('npm install');

  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch {
    log.warn('Firebase CLI not found. Installing globally...');
    await runCommand('npm install -g firebase-tools');
  }

  log.success('Dependencies installed successfully');
}

async function setupFirebase() {
  log.header('Firebase Setup');

  if (!process.env.FIREBASE_PROJECT_ID) {
    log.warn('Firebase project ID not found in .env file');
    const useFirebase = await askQuestion('Do you want to set up Firebase? (y/n)', 'y');

    if (useFirebase.toLowerCase() === 'y') {
      const projectId = await askQuestion('Enter your Firebase project ID');
      const privateKeyId = await askQuestion('Enter your Firebase private key ID');
      const privateKey = await askQuestion(
        'Enter your Firebase private key (enclosed in single quotes)'
      ).then((key) => key.replace(/\\n/g, '\n'));
      const clientEmail = await askQuestion('Enter your Firebase client email');
      const clientId = await askQuestion('Enter your Firebase client ID');
      const authUri = await askQuestion(
        'Enter your Firebase auth URI',
        'https://accounts.google.com/o/oauth2/auth'
      );
      const tokenUri = await askQuestion(
        'Enter your Firebase token URI',
        'https://oauth2.googleapis.com/token'
      );
      const authProviderX509CertUrl = await askQuestion(
        'Enter your auth provider x509 cert URL',
        'https://www.googleapis.com/oauth2/v1/certs'
      );
      const clientX509CertUrl = await askQuestion('Enter your client x509 cert URL');

      const firebaseConfig = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: privateKeyId,
        private_key: privateKey,
        client_email: clientEmail,
        client_id: clientId,
        auth_uri: authUri,
        token_uri: tokenUri,
        auth_provider_x509_cert_url: authProviderX509CertUrl,
        client_x509_cert_url: clientX509CertUrl,
        universe_domain: 'googleapis.com',
      };

      // Update .env file
      const envPath = path.join(__dirname, '../.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const updatedEnv =
        envContent +
        `\n# Firebase Configuration\n` +
        `FIREBASE_PROJECT_ID=${projectId}\n` +
        `FIREBASE_PRIVATE_KEY_ID=${privateKeyId}\n` +
        `FIREBASE_PRIVATE_KEY='${privateKey.replace(/\n/g, '\\n')}'\n` +
        `FIREBASE_CLIENT_EMAIL=${clientEmail}\n` +
        `FIREBASE_CLIENT_ID=${clientId}\n`;

      fs.writeFileSync(envPath, updatedEnv);

      // Also save the service account file
      const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
      fs.writeFileSync(serviceAccountPath, JSON.stringify(firebaseConfig, null, 2));

      log.success('Firebase configuration saved to .env and serviceAccountKey.json');
    }
  }

  // Initialize Firebase Admin
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    log.success('Firebase Admin initialized successfully');
  } catch (error) {
    log.warn('Failed to initialize Firebase Admin: ' + error.message);
  }
}

async function setupBackblaze() {
  log.header('Backblaze B2 Setup');

  if (!process.env.B2_APPLICATION_KEY_ID) {
    log.warn('Backblaze B2 credentials not found in .env file');
    const useB2 = await askQuestion('Do you want to set up Backblaze B2? (y/n)', 'y');

    if (useB2.toLowerCase() === 'y') {
      const keyId = await askQuestion('Enter your Backblaze B2 Application Key ID');
      const key = await askQuestion('Enter your Backblaze B2 Application Key');
      const bucketName = await askQuestion('Enter your Backblaze B2 Bucket Name', 'combomusic');
      const bucketId = await askQuestion('Enter your Backblaze B2 Bucket ID');
      const endpoint = await askQuestion(
        'Enter your Backblaze B2 Endpoint',
        'https://s3.us-east-005.backblazeb2.com'
      );
      const downloadUrl = await askQuestion(
        'Enter your Backblaze B2 Download URL',
        'https://f004.backblazeb2.com'
      );

      // Update .env file
      const envPath = path.join(__dirname, '../.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const updatedEnv =
        envContent +
        `\n# Backblaze B2 Configuration\n` +
        `B2_APPLICATION_KEY_ID=${keyId}\n` +
        `B2_APPLICATION_KEY=${key}\n` +
        `B2_BUCKET_NAME=${bucketName}\n` +
        `B2_BUCKET_ID=${bucketId}\n` +
        `B2_ENDPOINT=${endpoint}\n` +
        `B2_DOWNLOAD_URL=${downloadUrl}\n`;

      fs.writeFileSync(envPath, updatedEnv);
      log.success('Backblaze B2 configuration saved to .env');
    }
  }
}

async function setupAdminUser() {
  log.header('Admin User Setup');

  const email = await askQuestion('Enter admin email', 'admin@example.com');
  const password = await askQuestion('Enter admin password', 'admin123');
  const username = await askQuestion('Enter admin username', 'admin');

  try {
    await bcrypt.hash(password, 10);
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      emailVerified: true,
    });

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    // Save to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      username,
      role: 'admin',
      isEmailVerified: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    log.success(`Admin user created successfully with ID: ${userRecord.uid}`);
    log.success(`Email: ${email}`);
    log.success(`Password: ${password}`);
    log.warn('Please change the password after first login!');
  } catch (error) {
    log.error('Failed to create admin user: ' + error.message);
  }
}

async function runMigrations() {
  log.header('Running Database Migrations');

  try {
    // Create indexes
    const db = admin.firestore();

    // Create indexes for users collection
    await db.collection('users').doc('_index_').set({
      email: 1,
      username: 1,
      status: 1,
      createdAt: 1,
    });

    // Create indexes for tracks collection
    await db.collection('tracks').doc('_index_').set({
      title: 1,
      artist: 1,
      genre: 1,
      createdAt: 1,
    });

    // Create indexes for playlists collection
    await db.collection('playlists').doc('_index_').set({
      name: 1,
      owner: 1,
      isPublic: 1,
      createdAt: 1,
    });

    log.success('Database indexes created successfully');
  } catch (error) {
    log.error('Failed to run migrations: ' + error.message);
  }
}

async function main() {
  try {
    log.header('COMBO Music App Setup');

    // Check and create .env file
    await checkEnvFile();

    // Install dependencies
    await installDependencies();

    // Setup Firebase
    await setupFirebase();

    // Setup Backblaze B2
    await setupBackblaze();

    // Run database migrations
    await runMigrations();

    // Create admin user
    await setupAdminUser();

    log.success('\n🎉 Setup completed successfully!');
    log.info('\nNext steps:');
    log.info('1. Start the development server: npm run dev');
    log.info('2. Open http://localhost:5000 in your browser');
    log.info('3. Log in with the admin credentials you just created');
  } catch (error) {
    log.error('Setup failed: ' + error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main();
