const path = require('path');
const storageService = require('../services/storage.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

// Supported file types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_UPLOAD || '10000000');

/**
 * Upload a file to the configured storage provider
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder to upload to (e.g., 'avatars', 'tracks', 'covers')
 * @returns {Promise<Object>} - The uploaded file information
 */
const uploadFile = async (file, folder = 'uploads') => {
  try {
    // Check if file exists
    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES[file.mimetype]) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1000000}MB`
      );
    }

    // Create a custom filename
    const fileExt = ALLOWED_FILE_TYPES[file.mimetype];
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;

    // Upload the file
    const result = await storageService.uploadFile(file, folder);

    return {
      url: result.url,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: fileName,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Delete a file from the storage provider
 * @param {string} fileUrl - The URL of the file to delete
 * @returns {Promise<Object>} - The result of the delete operation
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file URL provided');
    }

    await storageService.deleteFile(fileUrl);
    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

/**
 * Get a readable stream for a file
 * @param {string} filePath - The path of the file to get
 * @returns {Promise<Stream>} - A readable stream of the file
 */
const getFileStream = async (filePath) => {
  try {
    if (!filePath) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file path provided');
    }

    return await storageService.getFileStream(filePath);
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileStream,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
};
