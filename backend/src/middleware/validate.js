const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Validates the request and throws an error if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Validation error', errors.array());
    return next(error);
  }
  next();
};

module.exports = { validate };
