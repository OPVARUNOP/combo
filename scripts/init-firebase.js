#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CONFIG_DIR = path.join(__dirname, '../config');
const SERVICE_ACCOUNT_PATH = path.join(CONFIG_DIR, 'firebase-service-account.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  console.log(`Created config directory: ${CONFIG_DIR}`);
}

// Check if service account already exists
if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  const stats = fs.statSync(SERVICE_ACCOUNT_PATH);
  const fileSize = (stats.size / 1024).toFixed(2);
  
  rl.question(`Firebase service account already exists (${fileSize} KB). Overwrite? (y/N) `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      promptForServiceAccount();
    } else {
      console.log('Operation cancelled.');
      rl.close();
    }
  });
} else {
  promptForServiceAccount();
}

function promptForServiceAccount() {
  console.log('\nPlease paste your Firebase service account JSON (end with a line containing only "DONE"):');
  
  let jsonInput = '';
  
  rl.on('line', (line) => {
    if (line.trim().toUpperCase() === 'DONE') {
      try {
        // Validate JSON
        const serviceAccount = JSON.parse(jsonInput);
        
        // Check required fields
        const requiredFields = [
          'type', 'project_id', 'private_key_id',
          'private_key', 'client_email', 'client_id'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in serviceAccount));
        
        if (missingFields.length > 0) {
          console.error(`\n❌ Invalid service account. Missing fields: ${missingFields.join(', ')}`);
          process.exit(1);
        }
        
        // Write to file with restricted permissions
        fs.writeFileSync(SERVICE_ACCOUNT_PATH, JSON.stringify(serviceAccount, null, 2));
        fs.chmodSync(SERVICE_ACCOUNT_PATH, 0o600); // rw-------
        
        console.log(`\n✅ Firebase service account saved to: ${SERVICE_ACCOUNT_PATH}`);
        console.log('🔒 File permissions set to 600 (read/write for owner only)');
        
        // Create .env file if it doesn't exist
        const envPath = path.join(__dirname, '../.env');
        if (!fs.existsSync(envPath)) {
          const envTemplate = `# Firebase Configuration
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_DATABASE_URL=https://${serviceAccount.project_id}.firebaseio.com

# Server Configuration
NODE_ENV=development
PORT=8080

# Security
TRUST_PROXY=0
DISABLE_AUTH=false
`;
          fs.writeFileSync(envPath, envTemplate);
          console.log('\n📝 Created .env file with default configuration');
        }
        
        console.log('\n🔧 Next steps:');
        console.log('1. Run `npm run verify:firebase` to test the connection');
        console.log('2. Run `npm run dev` to start the development server');
        
      } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
      } finally {
        rl.close();
      }
    } else {
      jsonInput += line + '\n';
    }
  });
}

// Handle process termination
rl.on('close', () => {
  process.exit(0);
});
