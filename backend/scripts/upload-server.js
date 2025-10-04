require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { B2Service } = require('../src/services/b2-service-fixed');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('dev'));

// Initialize B2 Service
const b2Service = new B2Service();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Configure multer with environment variables
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
const allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'image/*,audio/*,application/pdf')
  .split(',')
  .map((type) => type.trim());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    if (
      allowedFileTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.mimetype.startsWith(type.split('/*')[0]);
        }
        return file.mimetype === type;
      })
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedFileTypes.join(', ')} are allowed.`), false);
    }
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'B2 Upload Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// List files endpoint
app.get('/api/files', async (req, res) => {
  try {
    const prefix = req.query.prefix || '';
    console.log(`Listing files with prefix: ${prefix}`);

    const result = await b2Service.listFiles(prefix);

    res.json({
      status: 'success',
      data: {
        files: result.files.map((file) => ({
          id: file.fileId,
          name: file.fileName.split('/').pop(),
          path: file.fileName,
          size: file.size,
          mimeType: file.contentType,
          uploadDate: file.uploadTimestamp,
          url: file.downloadUrl || b2Service.getPublicUrl(file.fileName),
        })),
      },
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete file endpoint
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { fileName } = req.query;

    if (!fileId || !fileName) {
      return res.status(400).json({
        status: 'error',
        message: 'File ID and file name are required',
      });
    }

    console.log(`Deleting file: ${fileName} (${fileId})`);
    await b2Service.deleteFile(fileId, fileName);

    res.json({
      status: 'success',
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded or file is empty',
      });
    }

    const fileInfo = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
      encoding: req.file.encoding,
    };

    console.log('Upload request received:', {
      file: fileInfo.originalname,
      size: fileInfo.size,
      type: fileInfo.mimetype,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Upload to Backblaze B2
    const uploadResult = await b2Service.uploadFile(
      {
        name: fileInfo.originalname,
        data: fileInfo.buffer,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
      },
      'web-upload'
    );

    const response = {
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        id: uploadResult.fileId,
        name: fileInfo.originalname,
        size: fileInfo.size,
        mimeType: fileInfo.mimetype,
        url: uploadResult.downloadUrl,
        uploadDate: new Date().toISOString(),
        metadata: {
          uploader: 'web-upload',
          processingTime: `${Date.now() - startTime}ms`,
        },
      },
    };

    console.log('Upload successful:', {
      fileId: uploadResult.fileId,
      size: fileInfo.size,
      duration: `${Date.now() - startTime}ms`,
    });

    res.json(response);
  } catch (error) {
    console.error('Upload error:', {
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`,
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Upload limit: ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`Allowed file types: ${allowedFileTypes.join(', ')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Serve the test upload page
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, '../temp-public/test-upload.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
  });
});

// Start the server
const httpServer = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Upload limit: ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`- Allowed file types: ${allowedFileTypes.join(', ')}`);
  console.log(`- Test upload page: http://localhost:${port}/test-upload`);
  console.log(`- API Endpoint: http://localhost:${port}/api`);
  console.log(`- Health check: http://localhost:${port}/api/health`);
});

// Handle server shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  httpServer.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = httpServer;
