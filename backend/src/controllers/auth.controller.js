const httpStatus = require('http-status');
const { User } = require('../models');
const { tokenService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const register = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  const user = await User.create({
    ...userBody,
    role: 'user', // Default role
  });
  
  return user;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  return user;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ 
    token: refreshToken, 
    type: 'refresh',
    blacklisted: false,
  });
  
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, 'refresh');
    const user = await User.findById(refreshTokenDoc.user);
    
    if (!user) {
      throw new Error();
    }
    
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshTokens = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, 'refresh');
    const user = await User.findById(refreshTokenDoc.user);

    if (!user) {
      throw new Error();
    }

    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Forgot password
 * @param {string} email
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  // Generate reset password token
  const resetPasswordToken = tokenService.generateResetPasswordToken(user);
  // Here you would typically send an email with the reset token
  // For now, we'll just return success
  return { message: 'Password reset token generated' };
};

/**
 * Send verification email
 * @param {Object} user
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (user) => {
  const verifyEmailToken = tokenService.generateVerifyEmailToken(user);
  // Here you would typically send an email with the verification token
  // For now, we'll just return success
  return { message: 'Verification email sent' };
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      'resetPassword'
    );

    const user = await User.findById(resetPasswordTokenDoc.user);

    if (!user) {
      throw new Error();
    }

    user.password = newPassword;
    await user.save();

    await Token.deleteMany({ user: user.id, type: 'resetPassword' });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise<void>}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      'verifyEmail'
    );

    const user = await User.findById(verifyEmailTokenDoc.user);

    if (!user) {
      throw new Error();
    }

    await Token.deleteMany({ user: user.id, type: 'verifyEmail' });

    user.isEmailVerified = true;
    await user.save();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  register,
  login,
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  refreshTokens,
  resetPassword,
  verifyEmail,
  forgotPassword,
  sendVerificationEmail,
};
