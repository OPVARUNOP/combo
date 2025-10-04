const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to Firebase CLI JSON key
const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');

// Check if service account exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account not found at:', serviceAccountPath);
  process.exit(1);
}

// Read project ID from service account
const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

console.log(`🚀 Deploying Firestore security rules for project: ${projectId}`);

try {
  // Deploy Firestore rules
  console.log('\n🔒 Deploying Firestore security rules...');
  execSync('firebase deploy --only firestore:rules', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  console.log('\n✅ Firestore security rules deployed successfully!');
} catch (error) {
  console.error('\n❌ Failed to deploy Firestore security rules:', error.message);
  process.exit(1);
}
