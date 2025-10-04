const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Log the environment variables for debugging
console.log('Environment variables loaded:');
console.log('FIREBASE_PROJECT_ID:', envConfig.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', envConfig.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY_ID:', envConfig.FIREBASE_PRIVATE_KEY_ID ? '***' : 'Not set');
console.log('FIREBASE_PRIVATE_KEY:', envConfig.FIREBASE_PRIVATE_KEY ? '***' : 'Not set');

// Validate required environment variables
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_PRIVATE_KEY_ID',
];
const missingVars = requiredVars.filter((varName) => !envConfig[varName]);

if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Create service account object
const serviceAccount = {
  type: 'service_account',
  project_id: envConfig.FIREBASE_PROJECT_ID,
  private_key_id: envConfig.FIREBASE_PRIVATE_KEY_ID,
  private_key: envConfig.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
  client_email: envConfig.FIREBASE_CLIENT_EMAIL,
  client_id: envConfig.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(envConfig.FIREBASE_CLIENT_EMAIL)}`,
};

const targetPath = path.join(__dirname, '../service-account.json');
fs.writeFileSync(targetPath, JSON.stringify(serviceAccount, null, 2));
console.log(`Service account file created at: ${targetPath}`);
