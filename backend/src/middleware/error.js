const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Convert error to ApiError if needed
 */
const errorConverter = (err, req, res, next) => {
  let error = err;

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(
        httpStatus.BAD_REQUEST,
        `File too large. Maximum size: ${config.maxFileSize / 1000000}MB`
      );
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new ApiError(httpStatus.BAD_REQUEST, 'Unexpected file field');
    } else {
      error = new ApiError(httpStatus.BAD_REQUEST, err.message || 'File upload error');
    }
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

/**
 * Handle errors and send response
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
