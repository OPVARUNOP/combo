const multer = require('multer');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../utils/fileUpload');

// Memory storage for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`
      ),
      false
    );
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Middleware to handle single file upload
const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `File too large. Maximum size: ${MAX_FILE_SIZE / 1000000}MB`
          )
        );
      }
      return next(err);
    }
    next();
  });
};

// Middleware to handle multiple file uploads
const uploadMultiple =
  (fieldName, maxCount = 5) =>
  (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `One or more files are too large. Maximum size per file: ${MAX_FILE_SIZE / 1000000}MB`
            )
          );
        }
        return next(err);
      }
      next();
    });
  };

// Middleware to handle fields with file uploads
const uploadFields = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `One or more files are too large. Maximum size per file: ${MAX_FILE_SIZE / 1000000}MB`
          )
        );
      }
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  upload,
};
