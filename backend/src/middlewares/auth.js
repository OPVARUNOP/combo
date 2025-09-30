const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Authenticate user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const payload = jwt.verify(token, config.jwt.secret);
    
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const user = await User.findById(payload.sub);
    
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
};

/**
 * Authorize user based on required roles
 * @param {...string} requiredRights
 * @returns {import('express').RequestHandler}
 */
const authorize = (...requiredRights) => async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const userRights = roleRights.get(req.user.role);
    
    if (!userRights) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    const hasRequiredRights = requiredRights.every((requiredRight) =>
      userRights.includes(requiredRight)
    );

    if (!hasRequiredRights && req.params.userId !== req.user.id) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  auth,
  authorize,
};
