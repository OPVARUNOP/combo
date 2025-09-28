#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create config directory if it doesn't exist
const configDir = path.join(__dirname, '../config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const serviceAccountPath = path.join(configDir, 'firebase-service-account.json');

// Check if service account already exists
if (fs.existsSync(serviceAccountPath)) {
  console.log('Firebase service account already exists at:', serviceAccountPath);
  process.exit(0);
}

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Setting up Firebase Service Account');
console.log('------------------------------------');

// Get service account details
const questions = [
  'Enter project_id: ',
  'Enter private_key_id: ',
  'Enter private_key (press Enter, then paste the key, then press Enter twice): ',
  'Enter client_email: ',
  'Enter client_id: ',
  'Enter auth_uri [https://accounts.google.com/o/oauth2/auth]: ',
  'Enter token_uri [https://oauth2.googleapis.com/token]: ',
  'Enter auth_provider_x509_cert_url [https://www.googleapis.com/oauth2/v1/certs]: ',
  'Enter client_x509_cert_url: ',
  'Enter universe_domain [googleapis.com]: '
];

const answers = [];

function askQuestion(i) {
  if (i >= questions.length) {
    // All questions answered, create the service account file
    const serviceAccount = {
      type: 'service_account',
      project_id: answers[0],
      private_key_id: answers[1],
      private_key: answers[2].replace(/\\n/g, '\n'),
      client_email: answers[3],
      client_id: answers[4],
      auth_uri: answers[5] || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: answers[6] || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: answers[7] || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: answers[8],
      universe_domain: answers[9] || 'googleapis.com'
    };

    // Write the service account file
    fs.writeFileSync(
      serviceAccountPath,
      JSON.stringify(serviceAccount, null, 2),
      { mode: 0o600 } // Read/write for owner only
    );

    console.log('\n✅ Firebase service account configured successfully!');
    console.log(`📁 Location: ${serviceAccountPath}`);
    console.log('🔒 Permissions set to 600 (read/write for owner only)');
    
    rl.close();
    process.exit(0);
  }

  rl.question(questions[i], (answer) => {
    answers.push(answer.trim());
    askQuestion(i + 1);
  });
}

// Start asking questions
askQuestion(0);

// Handle multi-line private key input
let privateKeyLines = [];
rl.on('line', (line) => {
  if (line.trim() === '' && privateKeyLines.length > 0) {
    // Empty line after private key, process it
    answers.push(privateKeyLines.join('\n'));
    privateKeyLines = [];
    askQuestion(3); // Skip to next question after client_email
  } else if (privateKeyLines.length > 0 || line.includes('BEGIN PRIVATE KEY')) {
    // Collect private key lines
    privateKeyLines.push(line);
  }
});
