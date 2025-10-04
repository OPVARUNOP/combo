// test-b2-auth.js
const B2 = require('backblaze-b2');
const path = require('path');

// Load environment variables from the .env file in the project root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Log the environment variables we're using (masking sensitive values)
console.log('Environment:');
console.log(
  'B2_ACCOUNT_ID:',
  process.env.B2_ACCOUNT_ID ? '***' + process.env.B2_ACCOUNT_ID.slice(-4) : 'Not set'
);
console.log(
  'B2_APPLICATION_KEY:',
  process.env.B2_APPLICATION_KEY ? '***' + process.env.B2_APPLICATION_KEY.slice(-4) : 'Not set'
);
console.log('B2_ENDPOINT:', process.env.B2_ENDPOINT || 'Not set');
console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME || 'Not set');
console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID || 'Not set');
console.log('\n---\n');

// Initialize the B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  endpoint: process.env.B2_ENDPOINT,
  retry: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
  timeout: 30000,
});

console.log('Attempting to authorize with Backblaze B2...');

b2.authorize()
  .then(() => {
    console.log('✅ Successfully authorized with Backblaze B2!');
    console.log('\nFetching bucket information...\n');
    return b2.listBuckets();
  })
  .then((response) => {
    console.log('✅ Available buckets:');
    response.data.buckets.forEach((bucket) => {
      console.log(`- ${bucket.bucketName} (${bucket.bucketId})`);
      console.log(`  Type: ${bucket.bucketType}`);
      console.log(`  Created: ${new Date(bucket.createdAt).toLocaleString()}`);
      console.log(`  Private: ${bucket.bucketInfo.private ? 'Yes' : 'No'}`);
      console.log();
    });
  })
  .catch((error) => {
    console.error('❌ Error:');
    console.error('Status:', error.status || 'N/A');
    console.error('Code:', error.code || 'N/A');
    console.error('Message:', error.message || 'No error message');

    if (error.response?.data) {
      console.error('\nResponse data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.status === 401) {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. B2_ACCOUNT_ID is correct');
      console.error('2. B2_APPLICATION_KEY is correct and has not expired');
      console.error('3. The application key has the necessary permissions');
    }
  });
