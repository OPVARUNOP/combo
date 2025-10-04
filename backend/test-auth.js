const admin = require('firebase-admin');
const serviceAccount = require('/home/vrn/.config/combo/firebase-service-account.json');

// Ensure private key is properly formatted
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').trim();
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin
  .auth()
  .listUsers(1)
  .then(() => console.log('✅ Authentication successful'))
  .catch((error) => {
    console.error('❌ Authentication failed:');
    console.error('   - Error:', error.message);
    if (error.code) console.error('   - Code:', error.code);
    if (error.stack) console.error('   - Stack:', error.stack.split('\n')[1]);
  });
