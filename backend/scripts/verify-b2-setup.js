// verify-b2-setup.js
const B2 = require('backblaze-b2');

// Configuration from your details
const config = {
  accountId: '005a445afa8173c0000000003',
  applicationKey: 'K005rk6WrulBfQ4JHr6F3BjmuGJNgAI',
  bucketId: 'eac4e4b51acf9af89197031c',
  bucketName: 'comboapp',
  endpoint: 's3.us-east-005.backblazeb2.com',
};

console.log('=== Backblaze B2 Setup Verification ===');
console.log('Account ID:', config.accountId);
console.log('Application Key:', '***' + config.applicationKey.slice(-4));
console.log('Bucket Name:', config.bucketName);
console.log('Bucket ID:', config.bucketId);
console.log('Endpoint:', config.endpoint);
console.log('\n---\n');

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: config.accountId,
  applicationKey: config.applicationKey,
  endpoint: config.endpoint,
  retry: { retries: 3, minTimeout: 1000, maxTimeout: 5000 },
  timeout: 10000,
});

async function testConnection() {
  try {
    // Test authorization
    console.log('1. Testing authorization...');
    await b2.authorize();
    console.log('✅ Authorization successful!');

    // Test listing buckets
    console.log('\n2. Listing buckets...');
    const buckets = await b2.listBuckets();
    console.log('✅ Buckets retrieved successfully');

    const targetBucket = buckets.data.buckets.find((b) => b.bucketId === config.bucketId);
    if (!targetBucket) {
      throw new Error(`Bucket ${config.bucketId} not found in your account`);
    }
    console.log(`✅ Found bucket: ${targetBucket.bucketName} (${targetBucket.bucketId})`);

    // Test getting upload URL
    console.log('\n3. Testing upload URL...');
    await b2.getUploadUrl({ bucketId: config.bucketId });
    console.log('✅ Upload URL retrieved successfully');

    console.log('\n=== Backblaze B2 Setup is Correct ===');
    console.log('Your configuration is working correctly!');
  } catch (error) {
    console.error('\n❌ Error:');
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
    } else if (error.status === 403) {
      console.error('\nPermission denied. Please check:');
      console.error('1. The application key has the correct permissions');
      console.error('2. The bucket exists and is accessible with this key');
    }
  }
}

testConnection();
