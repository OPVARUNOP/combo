const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const { memoryStorage } = require('multer');
const logger = require('../utils/logger');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for larger files
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'video/mp4',
      'video/quicktime',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        'Invalid file type. Only images, documents, audio, video, and archives are allowed.'
      );
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    logger.error('Multer error:', { error: err.message, code: err.code });

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.',
        code: 'FILE_TOO_LARGE',
      });
    }

    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        error: err.message,
        code: err.code,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process file upload',
      code: 'UPLOAD_ERROR',
    });
  }
  next();
};

// Middleware to check if user is authenticated (simplified for example)
const isAuthenticated = (req, res, next) => {
  // In a real app, you would verify JWT or session here
  // For now, we'll just check if there's a user object
  if (!req.user) {
    req.user = { id: 'anonymous' }; // Default to anonymous user
  }
  next();
};

/**
 * @route POST /api/files/upload
 * @desc Upload a file directly to B2
 * @access Private
 */
router.post(
  '/upload',
  isAuthenticated,
  upload.single('file'),
  handleMulterError,
  fileController.uploadFile
);

/**
 * @route GET /api/files/download/:fileKey
 * @desc Get a download URL for a file
 * @access Private
 */
router.get(
  '/download/:fileKey',
  isAuthenticated,
  [
    param('fileKey')
      .notEmpty()
      .withMessage('File key is required')
      .isString()
      .withMessage('File key must be a string'),
  ],
  fileController.getDownloadUrl
);

/**
 * @route DELETE /api/files
 * @desc Delete a file
 * @access Private
 */
router.delete(
  '/',
  isAuthenticated,
  [
    body('fileKey')
      .notEmpty()
      .withMessage('File key is required')
      .isString()
      .withMessage('File key must be a string'),
    body('fileId')
      .notEmpty()
      .withMessage('File ID is required')
      .isString()
      .withMessage('File ID must be a string'),
  ],
  fileController.deleteFile
);

/**
 * @route GET /api/files
 * @desc List files for the current user
 * @access Private
 */
router.get(
  '/',
  isAuthenticated,
  [
    query('prefix').optional().isString().withMessage('Prefix must be a string'),
    query('delimiter').optional().isString().withMessage('Delimiter must be a string'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be an integer between 1 and 1000'),
  ],
  fileController.listFiles
);

module.exports = router;
