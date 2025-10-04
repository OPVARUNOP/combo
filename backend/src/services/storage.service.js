const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const { B2 } = require('backblaze-b2');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'backblaze';

    if (this.provider === 'firebase') {
      this.storage = admin.storage();
      this.bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    } else if (this.provider === 'backblaze') {
      this.b2 = new B2({
        applicationKeyId: process.env.B2_APPLICATION_KEY_ID || process.env.B2_ACCOUNT_ID,
        applicationKey: process.env.B2_APPLICATION_KEY,
        endpoint: process.env.B2_ENDPOINT,
      });
      this.bucketName = process.env.B2_BUCKET_NAME;
      this.bucketId = process.env.B2_BUCKET_ID;
    }
  }

  async uploadFile(file, destinationPath) {
    try {
      if (this.provider === 'firebase') {
        return await this.uploadToFirebase(file, destinationPath);
      } else {
        return await this.uploadToBackblaze(file, destinationPath);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadToFirebase(file, destinationPath) {
    const filePath = path.join(destinationPath, file.originalname);
    const fileUpload = this.bucket.file(filePath);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileUpload.name}`;
        resolve({
          url: publicUrl,
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          provider: 'firebase',
        });
      });

      blobStream.end(file.buffer);
    });
  }

  async uploadToBackblaze(file, destinationPath) {
    try {
      await this.b2.authorize();

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = destinationPath ? `${destinationPath}/${fileName}` : fileName;

      const response = await this.b2.uploadFile({
        uploadUrl: null, // Will be fetched automatically
        uploadAuthToken: null, // Will be fetched automatically
        fileName: filePath,
        data: file.buffer,
        mime: file.mimetype,
        contentLength: file.size,
      });

      const fileId = response.data.fileId;
      const downloadUrl = `${process.env.B2_DOWNLOAD_URL || `https://${process.env.B2_ENDPOINT}`}/file/${process.env.B2_BUCKET_NAME}/${filePath}`;

      return {
        url: downloadUrl,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        provider: 'backblaze',
        fileId: fileId,
        bucketId: this.bucketId,
      };
    } catch (error) {
      console.error('Backblaze upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl) {
    try {
      if (this.provider === 'firebase') {
        return await this.deleteFromFirebase(fileUrl);
      } else {
        return await this.deleteFromBackblaze(fileUrl);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async deleteFromFirebase(fileUrl) {
    // Extract the file path from the URL
    const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
    const file = this.bucket.file(filePath);

    try {
      await file.delete();
      return { success: true };
    } catch (error) {
      if (error.code === 404) {
        console.log('File not found, might already be deleted');
        return { success: true };
      }
      throw error;
    }
  }

  async deleteFromBackblaze(fileUrl) {
    try {
      await this.b2.authorize();

      // Extract the file path from the URL
      const filePath = fileUrl.split(`/file/${this.bucketName}/`)[1];

      // First, get the file info to get the fileId
      const listResponse = await this.b2.listFileVersions({
        bucketId: this.bucketId,
        prefix: filePath,
      });

      if (!listResponse.data.files || listResponse.data.files.length === 0) {
        console.log('File not found, might already be deleted');
        return { success: true };
      }

      const fileInfo = listResponse.data.files[0];

      // Delete the file
      await this.b2.deleteFileVersion({
        fileId: fileInfo.fileId,
        fileName: fileInfo.fileName,
      });

      return { success: true };
    } catch (error) {
      console.error('Backblaze delete error:', error);
      throw error;
    }
  }

  async getFileStream(filePath) {
    if (this.provider === 'firebase') {
      const file = this.bucket.file(filePath);
      return file.createReadStream();
    } else {
      await this.b2.authorize();
      const response = await this.b2.downloadFileByName({
        bucketName: this.bucketName,
        fileName: filePath,
        responseType: 'stream',
      });
      return response.data;
    }
  }
}

module.exports = new StorageService();
