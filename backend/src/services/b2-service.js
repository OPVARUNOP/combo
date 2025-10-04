const B2 = require('backblaze-b2');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class B2Service {
  constructor() {
    // Backblaze B2 Configuration - Using environment variables for security
    this.b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID || '005a445afa8173c0000000004',
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

        // If bucketId is not provided, try to get it
        if (!this.bucketId) {
          const buckets = await this.b2.listBuckets();
          const bucket = buckets.data.buckets.find((b) => b.bucketName === this.bucketName);
          if (bucket) {
            this.bucketId = bucket.bucketId;
            logger.debug(`Found bucket ID: ${this.bucketId}`);
          } else {
            throw new Error(`Bucket '${this.bucketName}' not found`);
          }
        }

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

  async uploadFile(file, userId, metadata = {}) {
    try {
      await this.initialize();

      // Ensure we have the file data
      if (!file || !file.originalname || !file.buffer) {
        throw new Error('Invalid file object. Expected { originalname, buffer, mimetype }');
      }

      // Generate a unique file key with user folder
      const fileExt = file.originalname.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExt}`;
      const fileKey = `users/${userId || 'uploads'}/${uniqueFileName}`;

      logger.debug(`Uploading file: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);

      // Get upload URL
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      // Upload the file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileKey,
        data: file.buffer,
        mime: file.mimetype || 'application/octet-stream',
        info: {
          originalFileName: file.originalname,
          uploader: userId || 'anonymous',
          ...metadata,
        },
        onUploadProgress: (event) => {
          if (event.loaded && event.total) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            logger.debug(`Upload progress: ${percentComplete}%`);
          }
        },
      });

      logger.info(`File uploaded successfully: ${fileKey}`);

      // Get the download URL
      const downloadUrl = this.getPublicUrl(fileKey);

      return {
        fileId: uploadResponse.data.fileId,
        fileName: file.originalname,
        fileKey,
        fileUrl: downloadUrl,
        size: file.size,
        mimeType: file.mimetype,
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('File upload failed:', {
        error: error.response?.data || error.message,
        fileName: file?.originalname,
        userId,
      });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileId, fileKey) {
    try {
      await this.initialize();
      logger.debug(`Deleting file: ${fileKey}`);

      const response = await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileKey,
      });

      logger.info(`File deleted successfully: ${fileKey}`);
      return { success: true, fileId, fileKey };
    } catch (error) {
      logger.error('File deletion failed:', {
        error: error.response?.data || error.message,
        fileKey,
        fileId,
      });
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getFileInfo(fileId) {
    try {
      await this.initialize();
      logger.debug(`Getting file info: ${fileId}`);

      const response = await this.b2.getFileInfo({ fileId });

      return {
        ...response.data,
        downloadUrl: this.getPublicUrl(response.data.fileName),
      };
    } catch (error) {
      logger.error('Failed to get file info:', {
        error: error.response?.data || error.message,
        fileId,
      });
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  async listFiles(prefix = '', delimiter = '/', maxFileCount = 100) {
    try {
      await this.initialize();
      logger.debug(`Listing files with prefix: ${prefix}`);

      const response = await this.b2.listFileNames({
        bucketId: this.bucketId,
        prefix: prefix,
        delimiter: delimiter,
        maxFileCount: maxFileCount,
      });

      // Map the response to include download URLs
      const files = response.data.files.map((file) => ({
        ...file,
        downloadUrl: this.getPublicUrl(file.fileName),
        uploadTimestamp: new Date(file.uploadTimestamp).toISOString(),
      }));

      return {
        files,
        nextFileName: response.data.nextFileName,
        nextFileId: response.data.nextFileId,
      };
    } catch (error) {
      logger.error('Failed to list files:', {
        error: error.response?.data || error.message,
        prefix,
      });
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async downloadFile(fileId) {
    try {
      await this.initialize();
      logger.debug(`Downloading file: ${fileId}`);

      const fileInfo = await this.getFileInfo(fileId);
      const response = await this.b2.downloadFileById({
        fileId: fileId,
        responseType: 'stream',
      });

      return {
        ...fileInfo,
        stream: response.data,
        contentLength: response.headers['content-length'],
        contentType: response.headers['content-type'],
      };
    } catch (error) {
      logger.error('File download failed:', {
        error: error.response?.data || error.message,
        fileId,
      });
      throw new Error(`File download failed: ${error.message}`);
    }
  }
}

// Create a singleton instance
const b2Service = new B2Service();

module.exports = b2Service;
