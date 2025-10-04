require('dotenv').config();
const B2 = require('backblaze-b2');

// Override environment variables with provided values
process.env.B2_ACCOUNT_ID = '005a445afa8173c0000000004';
process.env.B2_APPLICATION_KEY = 'K005o8vkOQFqbtN0ENZqyd8djdYowkY';
process.env.B2_BUCKET_NAME = 'combomusic';
process.env.B2_BUCKET_ID = 'eac4e4b51acf9af89197031c';
process.env.B2_ENDPOINT = 's3.us-east-005.backblazeb2.com';
process.env.B2_DOWNLOAD_URL = 'https://f004.backblazeb2.com';

console.log('Testing Backblaze B2 Connection...');
console.log('Using endpoint:', process.env.B2_ENDPOINT);

const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  endpoint: process.env.B2_ENDPOINT,
  debug: true,
});

async function testConnection() {
  try {
    console.log('\n1. Authorizing with Backblaze B2...');
    await b2.authorize();
    console.log('✅ Authorization successful!');

    console.log('\n2. Getting upload URL...');
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    console.log('✅ Upload URL retrieved successfully!');
    console.log('   Upload URL:', uploadUrlResponse.data.uploadUrl);

    console.log('\n3. Listing buckets...');
    const bucketsResponse = await b2.listBuckets();
    console.log('✅ Buckets retrieved successfully!');
    console.log('   Available buckets:');
    bucketsResponse.data.buckets.forEach((bucket) => {
      console.log(`   - ${bucket.bucketName} (${bucket.bucketId})`);
    });

    console.log('\n✅ All tests passed! Your Backblaze B2 credentials are working correctly.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testConnection();
