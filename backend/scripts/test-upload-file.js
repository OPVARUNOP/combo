require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { B2Service } = require('../src/services/b2-service');

async function testUpload() {
  try {
    console.log('Initializing B2 Service...');
    const b2Service = new B2Service();
    await b2Service.initialize();

    console.log('\nCreating a test file...');
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(testFilePath, 'This is a test file for Backblaze B2 upload');

    console.log('Uploading test file...');
    const fileData = {
      path: testFilePath,
      name: testFileName,
      mimeType: 'text/plain',
    };

    console.log('\nCalling uploadFile...');
    const result = await b2Service.uploadFile(fileData, 'test-upload');

    console.log('\n✅ File uploaded successfully!');
    console.log('File ID:', result.fileId);
    console.log('File Name:', result.fileKey);
    console.log('Download URL:', result.downloadUrl);

    // Clean up the test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testUpload();
