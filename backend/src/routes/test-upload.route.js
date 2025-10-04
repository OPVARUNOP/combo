const express = require('express');
const router = express.Router();
const multer = require('multer');
const b2Service = require('../services/b2-service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

// Set up multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid file type. Only images, audio, and PDFs are allowed.'
        ),
        false
      );
    }
  },
});

/**
 * POST /test-upload
 * Upload a file to Backblaze B2
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    // Initialize B2 service
    const b2 = await b2Service.initialize();

    // Create a file object that matches what the service expects
    const file = {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    // Upload the file using our service
    const result = await b2.uploadFile(file, 'test-upload-user');

    res.status(httpStatus.CREATED).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        fileId: result.fileId,
        fileName: result.fileKey,
        fileUrl: result.downloadUrl,
        size: result.size,
        mimeType: result.mimeType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /test-upload
 * List all test uploads
 */
router.get('/', async (req, res, next) => {
  try {
    // Initialize B2 service
    const b2 = await b2Service.initialize();

    // List files in the test-uploads directory
    const files = await b2.listFiles('test-uploads/');

    // Format the response
    const formattedFiles = files.data.files.map((file) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileUrl: b2.getPublicUrl(file.fileName),
      size: file.contentLength,
      mimeType: file.contentType,
      uploadTimestamp: file.uploadTimestamp,
    }));

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Test uploads retrieved successfully',
      data: {
        count: formattedFiles.length,
        files: formattedFiles,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
