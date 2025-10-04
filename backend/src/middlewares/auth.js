const httpStatus = require('http-status');
const admin = require('firebase-admin');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to authenticate Firebase ID token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  };
};

/**
 * Authorize user based on required roles
 * @param {...string} requiredRoles - Roles that are allowed to access the route
 * @returns {import('express').RequestHandler}
 */
const authRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    if (!requiredRoles.includes(req.user.role)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    next();
  };
};

module.exports = {
  auth,
  authRole,
};
