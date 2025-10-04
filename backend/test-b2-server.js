require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const b2Service = require('./src/services/b2-service');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
      cb(new Error('Invalid file type. Only images, audio, and PDFs are allowed.'), false);
    }
  },
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'B2 Test Server is running' });
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
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

    res.status(201).json({
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
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'File upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// List files
app.get('/api/files', async (req, res) => {
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

    res.json({
      status: 'success',
      message: 'Files retrieved successfully',
      data: {
        count: formattedFiles.length,
        files: formattedFiles,
      },
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to list files',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Serve the test upload page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`B2 Test Server running on http://localhost:${port}`);
  console.log(`- Test upload page: http://localhost:${port}`);
  console.log(`- API Endpoint: http://localhost:${port}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
