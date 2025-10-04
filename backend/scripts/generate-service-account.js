#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

async function main() {
  try {
    log.info('\n=== Firebase Service Account Setup ===');

    const projectId = await askQuestion('Enter your Firebase Project ID');
    const privateKeyId = await askQuestion('Enter your Private Key ID');
    const privateKey = await askQuestion('Enter your Private Key (enclosed in single quotes)');
    const clientEmail = await askQuestion('Enter your Client Email');
    const clientId = await askQuestion('Enter your Client ID');
    const authUri = await askQuestion(
      'Enter Auth URI',
      'https://accounts.google.com/o/oauth2/auth'
    );
    const tokenUri = await askQuestion('Enter Token URI', 'https://oauth2.googleapis.com/token');
    const authProviderX509CertUrl = await askQuestion(
      'Enter Auth Provider x509 Cert URL',
      'https://www.googleapis.com/oauth2/v1/certs'
    );
    const clientX509CertUrl = await askQuestion('Enter Client x509 Cert URL');

    const serviceAccount = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
      client_id: clientId,
      auth_uri: authUri,
      token_uri: tokenUri,
      auth_provider_x509_cert_url: authProviderX509CertUrl,
      client_x509_cert_url: clientX509CertUrl,
      universe_domain: 'googleapis.com',
    };

    // Create the service account file
    const filePath = path.join(process.cwd(), 'serviceAccountKey.json');
    fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));

    // Set appropriate permissions
    fs.chmodSync(filePath, 0o600);

    log.success(`Service account key file created at: ${filePath}`);
    log.info('\n✅ Firebase service account setup complete!');
  } catch (error) {
    log.error(`Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

main();
