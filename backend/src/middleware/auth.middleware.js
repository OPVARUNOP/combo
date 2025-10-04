const admin = require('firebase-admin');
const logger = require('../config/logger');

/**
 * Middleware to authenticate Firebase ID token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Get the user's record from Firestore
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found. Please register first.',
        });
      }

      const userData = userDoc.data();

      // Check if user is active
      if (userData.status !== 'active') {
        return res.status(403).json({
          status: 'error',
          message: 'Account is deactivated. Please contact support.',
        });
      }

      // Attach user to request object
      req.user = {
        id: userDoc.id,
        ...userData,
        uid: decodedToken.uid,
      };

      next();
    } catch (error) {
      logger.error('Token verification error:', error);

      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          status: 'error',
          message: 'Session expired. Please log in again.',
        });
      }

      if (error.code === 'auth/argument-error') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token format. Please provide a valid token.',
        });
      }

      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please log in again.',
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication.',
    });
  }
};

/**
 * Middleware to check user roles
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    // If no roles specified, allow access
    if (roles.length === 0) {
      return next();
    }

    // Check if user has any of the required roles
    const hasRole = roles.some((role) => req.user.roles?.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is the owner of the resource or has admin role
 * @param {string} resourcePath - Path to the resource in Firestore (e.g., 'users/{userId}')
 * @returns {Function} Express middleware function
 */
const isOwnerOrAdmin = (resourcePath) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required.',
        });
      }

      // Admin can access any resource
      if (req.user.roles?.includes('admin')) {
        return next();
      }

      // Replace placeholders in the resource path
      const path = resourcePath.replace('{userId}', req.user.uid);

      // Check if the resource exists and belongs to the user
      const [collection, docId] = path.split('/');
      const doc = await admin.firestore().collection(collection).doc(docId).get();

      if (!doc.exists) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found.',
        });
      }

      // Check if the resource belongs to the user
      const resourceData = doc.data();
      if (resourceData.userId !== req.user.uid) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource.',
        });
      }

      // Attach the resource to the request object
      req.resource = {
        id: doc.id,
        ...resourceData,
      };

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during authorization.',
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  isOwnerOrAdmin,
};
