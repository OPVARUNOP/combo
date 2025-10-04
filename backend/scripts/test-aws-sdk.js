// test-aws-sdk.js
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
// Configuration
const config = {
  credentials: {
    accessKeyId: '005a445afa8173c0000000003', // This is your B2_ACCOUNT_ID
    secretAccessKey: 'K005rk6WrulBfQ4JHr6F3BjmuGJNgAI', // This is your B2_APPLICATION_KEY
  },
  endpoint: 'https://s3.us-east-005.backblazeb2.com',
  region: 'us-east-005',
};

console.log('=== Testing AWS SDK with Backblaze B2 ===');
console.log('Endpoint:', config.endpoint);
console.log('Region:', config.region);
console.log('Access Key ID:', config.credentials.accessKeyId);
console.log('Secret Access Key:', '***' + (config.credentials.secretAccessKey || '').slice(-4));
console.log('\n---\n');

// Create S3 client
const s3Client = new S3Client(config);

async function testConnection() {
  try {
    console.log('1. Attempting to list buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    console.log('✅ Success! Available buckets:');
    response.Buckets.forEach((bucket) => {
      console.log(`- ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
  } catch (error) {
    console.error('\n❌ Error:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);

    if (error.$metadata) {
      console.error('\nMetadata:', JSON.stringify(error.$metadata, null, 2));
    }

    if (error.name === 'InvalidAccessKeyId') {
      console.error('\nThe Access Key ID you provided does not exist in our records.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error(
        '\nThe request signature we calculated does not match the signature you provided.'
      );
      console.error('This usually means your secret access key is incorrect.');
    } else if (error.name === 'AccessDenied') {
      console.error('\nAccess Denied. Please check your permissions.');
    }
  }
}

testConnection();
