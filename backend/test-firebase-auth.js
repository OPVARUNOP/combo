const admin = require('firebase-admin');
const fs = require('fs');

// 1. Load service account
const serviceAccountPath = '/home/vrn/.config/combo/firebase-service-account.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// 2. Print debug info
console.log('🔍 Service Account Details:');
console.log(`   - Project ID: ${serviceAccount.project_id}`);
console.log(`   - Client Email: ${serviceAccount.client_email}`);
console.log(`   - Private Key ID: ${serviceAccount.private_key_id}`);
console.log(`   - Private Key Length: ${serviceAccount.private_key.length} chars`);
console.log(`   - Private Key Start: ${serviceAccount.private_key.substring(0, 30)}...`);
console.log(
  `   - Private Key End: ...${serviceAccount.private_key.substring(serviceAccount.private_key.length - 30)}`
);

// 3. Format private key
const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

// 4. Initialize with explicit credentials
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: privateKey,
  }),
});

// 5. Test authentication
console.log('\n🔐 Testing Firebase Authentication...');
admin
  .auth()
  .listUsers(1)
  .then((listUsersResult) => {
    console.log('✅ Successfully authenticated with Firebase');
    console.log(`   - Found ${listUsersResult.users.length} user(s)`);
  })
  .catch((error) => {
    console.error('❌ Authentication failed:');
    console.error('   - Error:', error.message);
    console.error('   - Code:', error.code);

    if (error.errorInfo) {
      console.error('   - Error Info:', JSON.stringify(error.errorInfo, null, 2));
    }

    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
  });
