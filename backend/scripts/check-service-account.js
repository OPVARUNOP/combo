const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('../config/firebase-service-account.json');

async function checkServiceAccount() {
  try {
    console.log('🔍 Checking service account permissions...');

    const auth = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = await auth.getProjectId();

    console.log('✅ Service account is valid');
    console.log('   Project ID:', projectId);
    console.log('   Client email:', serviceAccount.client_email);

    // Try to get Firestore database info
    console.log('\n🔍 Checking Firestore database info...');
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`;
    const response = await client.request({ url });

    console.log('✅ Firestore database info:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Error checking service account:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);

    if (error.response?.data?.error) {
      console.error('Details:', error.response.data.error);
    }

    console.log('\nℹ️  Please verify:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log(`2. Select project: ${serviceAccount.project_id}`);
    console.log('3. Go to "IAM & Admin" > "Service Accounts"');
    console.log(`4. Find service account: ${serviceAccount.client_email}`);
    console.log(
      '5. Make sure it has the "Cloud Datastore User" and "Firebase Admin SDK Administrator Service Agent" roles'
    );
  }
}

checkServiceAccount();
