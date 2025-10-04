const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { uploadFile } = require('../src/config/backblaze');

// Log environment variables for debugging
console.log('B2_ACCOUNT_ID:', process.env.B2_ACCOUNT_ID ? '***' : 'Not set');
console.log('B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? '***' : 'Not set');
console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME || 'Not set');
console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID || 'Not set');
console.log('B2_ENDPOINT:', process.env.B2_ENDPOINT || 'Not set');
console.log('B2_DOWNLOAD_URL:', process.env.B2_DOWNLOAD_URL || 'Not set');

async function testB2Upload() {
  try {
    console.log('Testing Backblaze B2 integration...');

    // Create a test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const testContent =
      'This is a test file for Backblaze B2 integration - ' + new Date().toISOString();
    fs.writeFileSync(testFilePath, testContent);

    console.log('Preparing to upload test file...');
    const file = {
      originalname: 'test-upload-' + Date.now() + '.txt',
      path: testFilePath,
      mimetype: 'text/plain',
      buffer: fs.readFileSync(testFilePath),
      size: fs.statSync(testFilePath).size,
    };

    // Upload the file to a 'test-uploads' folder
    console.log('Uploading test file...');
    const result = await uploadFile(file, 'test-uploads');

    console.log('\n✅ File uploaded successfully!');
    console.log('File URL:', result.url);
    console.log('File ID:', result.fileId);
    console.log('File Size:', (result.size / 1024).toFixed(2), 'KB');

    // Clean up
    fs.unlinkSync(testFilePath);

    console.log('\nBackblaze B2 integration test completed successfully!');
    console.log('You can check the file at:', result.url);
  } catch (error) {
    console.error('❌ Error testing Backblaze B2 integration:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

testB2Upload();
