const fs = require('fs');
const path = require('path');

// Path to the .env file
const envPath = path.join(__dirname, '../.env');

// Read the current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update Firebase configuration
const updates = {
  FIREBASE_PROJECT_ID: 'combo-624e1',
  FIREBASE_PRIVATE_KEY_ID: 'c041b569084663f2ccf7c680699524a582e9af20',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@combo-624e1.iam.gserviceaccount.com',
  FIREBASE_DATABASE_URL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  FIREBASE_STORAGE_BUCKET: 'combo-624e1.appspot.com',
};

// Update each environment variable
Object.entries(updates).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
});

// Write the updated content back to .env
fs.writeFileSync(envPath, envContent);
console.log('Updated .env file with Firebase configuration.');
