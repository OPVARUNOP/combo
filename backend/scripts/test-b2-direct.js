// test-b2-direct.js
const B2 = require('backblaze-b2');
// Hardcoded credentials for testing only - REMOVE AFTER TESTING
const config = {
  accountId: '005a445afa8173c0000000003',
  applicationKey: 'K005rk6WrulBfQ4JHr6F3BjmuGJNgAI',
  endpoint: 's3.us-east-005.backblazeb2.com',
};

console.log('Testing with direct credentials...');
console.log('Account ID:', config.accountId);
console.log(
  'Application Key:',
  config.applicationKey ? '***' + config.applicationKey.slice(-4) : 'Not set'
);
console.log('Endpoint:', config.endpoint);
console.log('\n---\n');

const b2 = new B2({
  applicationKeyId: config.accountId,
  applicationKey: config.applicationKey,
  endpoint: config.endpoint,
  retry: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
  timeout: 10000,
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
      console.log();
    });

    // Delete this file after successful test
    console.log(
      '\n⚠️  IMPORTANT: Delete this test file after use as it contains sensitive credentials!'
    );
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
      console.error('1. The account ID is correct');
      console.error('2. The application key is correct and has not expired');
      console.error('3. The application key has the necessary permissions');
      console.error('4. The endpoint is correct for your region');
    }
  });
