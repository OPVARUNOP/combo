const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Middleware to authenticate and authorize requests
 * @param {Array} roles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const auth = (roles = []) => {
  // Convert string to array if a single role is passed
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      // 1) Get token from header
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not logged in! Please log in to get access.'
        );
      }

      // 2) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'The user belonging to this token no longer exists.'
        );
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'User recently changed password! Please log in again.'
        );
      }

      // 5) Check if user account is active
      if (currentUser.status !== 'active') {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Your account has been deactivated. Please contact support.'
        );
      }

      // 6) Check user role
      if (roles.length && !roles.includes(currentUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action'
        );
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = currentUser;
      res.locals.user = currentUser;
      next();
    } catch (error) {
      // Handle JWT errors
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token. Please log in again!'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(
          new ApiError(httpStatus.UNAUTHORIZED, 'Your token has expired! Please log in again.')
        );
      }
      next(error);
    }
  };
};

/**
 * Middleware to restrict access to authenticated users only
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please log in to access this resource');
  }
  next();
};

/**
 * Middleware to restrict access to admin users only
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to perform this action. Admin access required.'
    );
  }
  next();
};

/**
 * Middleware to check if the user is the owner of the resource or an admin
 */
const isOwnerOrAdmin = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[idParam]);

      if (!resource) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Resource not found');
      }

      // Allow if user is admin or the owner of the resource
      if (req.user.role !== 'admin' && resource.user.toString() !== req.user.id) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action'
        );
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  auth,
  isAuthenticated,
  isAdmin,
  isOwnerOrAdmin,
};
