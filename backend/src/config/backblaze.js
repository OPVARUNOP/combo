const B2 = require('backblaze-b2');

// Load environment variables
require('dotenv').config();

// Initialize Backblaze B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  endpoint: process.env.B2_ENDPOINT,
  // Add retry configuration for better reliability
  retry: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
  // Add timeout for requests (in ms)
  timeout: 30000,
});

// Track initialization state
let isInitialized = false;

// Authorize and get upload URL
const initializeB2 = async () => {
  if (!isInitialized) {
    try {
      await b2.authorize();
      console.log('Backblaze B2 authorized successfully');
      isInitialized = true;
    } catch (error) {
      console.error('Error initializing Backblaze B2:', error);
      throw error;
    }
  }
  return b2;
};

// Get upload URL for a specific bucket
const getUploadUrl = async (bucketId = process.env.B2_BUCKET_ID) => {
  try {
    await initializeB2();
    const response = await b2.getUploadUrl({ bucketId });
    return response.data;
  } catch (error) {
    console.error('Error getting upload URL:', error);
    throw error;
  }
};

// Generate a download URL for a file
const getDownloadUrl = (fileName, bucketName = process.env.B2_BUCKET_NAME) => {
  return `${process.env.B2_DOWNLOAD_URL}/file/${bucketName}/${fileName}`;
};

// Upload a file to B2
const uploadFile = async (file, folder = '') => {
  try {
    await initializeB2();

    // Generate a unique file name
    const fileName = folder ? `${folder}/${file.originalname}` : file.originalname;

    // Get upload URL and authorization token
    const uploadData = await getUploadUrl();

    // Upload the file
    const response = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName: fileName,
      data: file.buffer,
      contentLength: file.size,
      mime: file.mimetype,
    });

    // Return the file URL and metadata
    return {
      url: getDownloadUrl(fileName),
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: fileName,
      fileId: response.data.fileId,
    };
  } catch (error) {
    console.error('Error uploading file to B2:', error);
    throw error;
  }
};

module.exports = {
  b2,
  initializeB2,
  getUploadUrl,
  getDownloadUrl,
  uploadFile,
};
