const b2Service = require('../services/b2-service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class FileController {
  /**
   * Handle direct file upload
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        logger.warn('No file provided in upload request');
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Please provide a file.',
        });
      }

      const userId = req.user?.id || 'anonymous';
      const metadata = {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      logger.info(
        `Starting file upload: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`,
        {
          userId,
          mimeType: req.file.mimetype,
        }
      );

      const result = await b2Service.uploadFile(req.file, userId, metadata);
      logger.info('File upload successful', { fileKey: result.fileKey, fileId: result.fileId });

      res.status(201).json({
        success: true,
        data: {
          fileId: result.fileId,
          fileName: result.originalName,
          fileKey: result.fileKey,
          downloadUrl: result.downloadUrl,
          size: result.size,
          mimeType: result.mimeType,
          uploadedAt: result.metadata.uploadedAt,
        },
      });
    } catch (error) {
      logger.error('File upload failed', {
        error: error.message,
        originalName: req.file?.originalname,
        size: req.file?.size,
        stack: error.stack,
      });

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to upload file',
        code: error.code,
      });
    }
  }

  /**
   * Get a download URL for a file
   */
  async getDownloadUrl(req, res) {
    try {
      const { fileKey } = req.params;
      const userId = req.user?.id || 'anonymous';

      if (!fileKey) {
        return res.status(400).json({
          success: false,
          error: 'File key is required',
        });
      }

      logger.info(`Generating download URL for file: ${fileKey}`, { userId });

      const { url, expiresAt } = await b2Service.getDownloadUrl(fileKey);

      logger.info('Download URL generated successfully', { fileKey, expiresAt });

      res.json({
        success: true,
        data: {
          downloadUrl: url,
          expiresAt,
          fileKey,
        },
      });
    } catch (error) {
      logger.error('Failed to generate download URL', {
        error: error.message,
        fileKey: req.params.fileKey,
        stack: error.stack,
      });

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to generate download URL',
        code: error.code,
      });
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(req, res) {
    try {
      const { fileKey, fileId } = req.body;
      const userId = req.user?.id;

      if (!fileKey || !fileId) {
        return res.status(400).json({
          success: false,
          error: 'Both fileKey and fileId are required for deletion',
        });
      }

      logger.info(`Deleting file: ${fileKey}`, { userId, fileId });

      await b2Service.deleteFile(fileKey, fileId);

      logger.info('File deleted successfully', { fileKey, fileId });

      res.json({
        success: true,
        message: 'File deleted successfully',
        data: { fileKey, fileId },
      });
    } catch (error) {
      logger.error('File deletion failed', {
        error: error.message,
        fileKey: req.body?.fileKey,
        fileId: req.body?.fileId,
        stack: error.stack,
      });

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to delete file',
        code: error.code,
      });
    }
  }

  /**
   * List files for a user
   */
  async listFiles(req, res) {
    try {
      const userId = req.user?.id;
      const { prefix = '', delimiter = '/', limit = 100 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to list files',
        });
      }

      // Ensure the prefix is scoped to the user's directory
      const userPrefix = `users/${userId}/${prefix}`;

      logger.info(`Listing files for user: ${userId}`, { prefix: userPrefix });

      const result = await b2Service.listFiles(userPrefix, delimiter, parseInt(limit));

      res.json({
        success: true,
        data: {
          files: result.files,
          nextFileName: result.nextFileName,
          nextFileId: result.nextFileId,
          count: result.files.length,
        },
      });
    } catch (error) {
      logger.error('Failed to list files', {
        error: error.message,
        prefix: req.query.prefix,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list files',
      });
    }
  }
}

module.exports = new FileController();
