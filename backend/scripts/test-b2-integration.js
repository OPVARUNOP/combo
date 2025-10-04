require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const b2Service = require('../src/services/b2-service');
const logger = require('../src/utils/logger');

async function testB2Integration() {
  try {
    logger.info('Starting B2 integration test...');

    // Test file path - using a sample file in the project
    const testFilePath = path.join(__dirname, '../test-upload.txt');
    const testFileContent = 'This is a test file for B2 integration';

    // Create a test file
    await fs.writeFile(testFilePath, testFileContent);
    logger.info(`Created test file at: ${testFilePath}`);

    // Read the test file
    const fileBuffer = await fs.readFile(testFilePath);
    const fileName = path.basename(testFilePath);

    // Mock file object similar to what multer provides
    const testFile = {
      originalname: fileName,
      buffer: fileBuffer,
      mimetype: 'text/plain',
      size: fileBuffer.length,
    };

    // Test 1: Upload file
    logger.info('Testing file upload...');
    const uploadResult = await b2Service.uploadFile(testFile, 'test-user', { test: true });
    logger.info('File uploaded successfully:', {
      fileId: uploadResult.fileId,
      fileKey: uploadResult.fileKey,
      downloadUrl: uploadResult.downloadUrl,
    });

    // Test 2: Get file info
    logger.info('Testing get file info...');
    const fileInfo = await b2Service.getFileInfo(uploadResult.fileId);
    logger.info('File info:', {
      fileName: fileInfo.fileName,
      contentLength: fileInfo.contentLength,
      contentType: fileInfo.contentType,
    });

    // Test 3: Generate download URL
    logger.info('Testing download URL generation...');
    const downloadUrl = await b2Service.getDownloadUrl(uploadResult.fileKey);
    logger.info('Download URL:', downloadUrl);

    // Test 4: List files
    logger.info('Testing file listing...');
    const fileList = await b2Service.listFiles('users/test-user/');
    logger.info(`Found ${fileList.files.length} files in user's directory`);

    // Test 5: Delete file
    logger.info('Testing file deletion...');
    const deleteResult = await b2Service.deleteFile(uploadResult.fileKey, uploadResult.fileId);
    logger.info('File deleted successfully:', deleteResult);

    // Clean up test file
    await fs.unlink(testFilePath);
    logger.info('Test file removed from local filesystem');

    logger.info('B2 integration test completed successfully!');
  } catch (error) {
    logger.error('B2 integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
testB2Integration();
