const B2 = require('backblaze-b2');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const logger = require('../utils/logger');

class B2Service {
  constructor() {
    // Backblaze B2 Configuration
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID || '005a445afa8173c0000000004',
      applicationKey: process.env.B2_APPLICATION_KEY || 'K005o8vkOQFqbtN0ENZqyd8djdYowkY',
      endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
      debug: process.env.NODE_ENV !== 'production',
      retry: {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
      },
      timeout: 30000,
    });

    // Bucket Configuration
    this.bucketName = process.env.B2_BUCKET_NAME || 'combomusic';
    this.bucketId = process.env.B2_BUCKET_ID || 'eac4e4b51acf9af89197031c';
    this.downloadUrl = process.env.B2_DOWNLOAD_URL || 'https://f004.backblazeb2.com';
    this.authorization = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      try {
        await this.authorize();
        this.initialized = true;
        logger.info('B2 Service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize B2 Service:', error);
        throw error;
      }
    }
    return this;
  }

  async authorize() {
    if (!this.authorization) {
      logger.debug('Authorizing with Backblaze B2...');
      try {
        const auth = await this.b2.authorize();
        this.authorization = auth.data;
        logger.info('B2 Authorization successful');
      } catch (error) {
        logger.error('B2 Authorization failed:', error.response?.data || error.message);
        throw new Error(`B2 Authorization failed: ${error.message}`);
      }
    }
    return this.authorization;
  }

  getPublicUrl(fileKey) {
    return `${this.downloadUrl}/file/${this.bucketName}/${encodeURIComponent(fileKey)}`;
  }

  async uploadFile(file, userId = 'test-user') {
    try {
      await this.initialize();

      // Ensure we have the file data
      if (!file || !file.name) {
        throw new Error('Invalid file object. Expected { name, data, mimetype }');
      }

      // Generate a unique file key
      const fileExt = file.name.split('.').pop();
      const fileKey = `test-uploads/${userId}-${Date.now()}.${fileExt}`;

      // Get file data as buffer
      let fileData = file.data;
      if (file.path) {
        // If we have a file path, read the file
        fileData = fs.readFileSync(file.path);
      } else if (typeof fileData === 'string') {
        // If data is a string, convert to buffer
        fileData = Buffer.from(fileData);
      } else if (!Buffer.isBuffer(fileData)) {
        throw new Error('File data must be a Buffer, string, or file path');
      }

      console.log('Getting upload URL...');
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      console.log('Uploading file...');
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileKey,
        data: fileData,
        mime: file.mimetype || 'application/octet-stream',
        info: {
          originalFileName: file.name,
          uploader: userId,
        },
      });

      // Get the download URL
      const downloadUrl = this.getPublicUrl(fileKey);

      return {
        fileId: uploadResponse.data.fileId,
        fileKey,
        downloadUrl,
        size: fileData.length,
        mimeType: file.mimetype || 'application/octet-stream',
        originalName: file.name,
      };
    } catch (error) {
      console.error('File upload failed:', error.response?.data || error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileId, fileKey) {
    try {
      await this.initialize();
      console.log(`Deleting file: ${fileKey}`);

      const response = await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileKey,
      });

      console.log(`File deleted successfully: ${fileKey}`);
      return { success: true, fileId, fileKey };
    } catch (error) {
      console.error('File deletion failed:', error.response?.data || error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async listFiles(prefix = '') {
    try {
      await this.initialize();
      console.log(`Listing files with prefix: ${prefix}`);

      const response = await this.b2.listFileNames({
        bucketId: this.bucketId,
        prefix: prefix,
        maxFileCount: 1000,
      });

      // Add download URLs to each file
      const files = response.data.files.map((file) => ({
        ...file,
        downloadUrl: this.getPublicUrl(file.fileName),
      }));

      return {
        files,
        nextFileName: response.data.nextFileName,
        nextFileId: response.data.nextFileId,
      };
    } catch (error) {
      console.error('Failed to list files:', error.response?.data || error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}

// Export the class for testing
module.exports = { B2Service };

// Also export a singleton instance for normal use
const b2Service = new B2Service();
module.exports.default = b2Service;
