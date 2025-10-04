const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const admin = require('firebase-admin');
const ApiError = require('../utils/ApiError');

// Token types for JWT
const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {Moment} expires - Expiration time
 * @param {string} type - Token type
 * @param {string} [secret=config.jwt.secret] - Secret key
 * @returns {string} Generated token
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Expected token type
 * @returns {Promise<Object>} Decoded token payload
 */
const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);

    // Verify token type if provided
    if (type && payload.type !== type) {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
};

/**
 * Generate auth tokens (access and refresh)
 * @param {Object} user - User object
 * @returns {Promise<Object>} Auth tokens
 */
const generateAuthTokens = async (user) => {
  // Generate access token (short-lived)
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  // Generate refresh token (long-lived)
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  // Store refresh token in Firestore
  await admin.firestore().collection('refreshTokens').doc(refreshToken).set({
    userId: user.id,
    token: refreshToken,
    expires: refreshTokenExpires.toDate(),
    type: tokenTypes.REFRESH,
    blacklisted: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email - User's email
 * @returns {Promise<string>} Reset password token
 */
const generateResetPasswordToken = async (email) => {
  try {
    // Check if user exists in Firebase Auth
    const user = await admin.auth().getUserByEmail(email);

    // Generate a reset password token with short expiration
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user.uid, expires, tokenTypes.RESET_PASSWORD);

    // Store the token in Firestore
    await admin.firestore().collection('tokens').doc(resetPasswordToken).set({
      userId: user.uid,
      token: resetPasswordToken,
      type: tokenTypes.RESET_PASSWORD,
      expires: expires.toDate(),
      blacklisted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return resetPasswordToken;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Don't reveal that the email doesn't exist
      return null;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate reset password token');
  }
};

/**
 * Generate verify email token
 * @param {Object} user - User object
 * @returns {Promise<string>} Verify email token
 */
const generateVerifyEmailToken = async (user) => {
  try {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user.uid, expires, tokenTypes.VERIFY_EMAIL);

    // Store the token in Firestore
    await admin.firestore().collection('tokens').doc(verifyEmailToken).set({
      userId: user.uid,
      token: verifyEmailToken,
      type: tokenTypes.VERIFY_EMAIL,
      expires: expires.toDate(),
      blacklisted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return verifyEmailToken;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate verification token');
  }
};

/**
 * Blacklist a token
 * @param {string} token - Token to blacklist
 * @returns {Promise<void>}
 */
const blacklistToken = async (token) => {
  try {
    await admin.firestore().collection('tokens').doc(token).update({
      blacklisted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to blacklist token');
  }
};

/**
 * Clean up expired tokens
 * @returns {Promise<void>}
 */
const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();
    const expiredTokens = await admin
      .firestore()
      .collection('tokens')
      .where('expires', '<=', now)
      .get();

    const batch = admin.firestore().batch();
    expiredTokens.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Schedule token cleanup every 24 hours
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  blacklistToken,
  tokenTypes,
};
