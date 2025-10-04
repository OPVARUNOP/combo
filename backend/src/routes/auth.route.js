const express = require('express');
const { body, query } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await authController.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await authController.login(req.body.email, req.body.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Refresh tokens route
router.post(
  '/refresh-tokens',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  async (req, res, next) => {
    try {
      const tokens = await authController.refreshTokens(req.body.refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }
);

// Forgot password route
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Must be a valid email')],
  validate,
  async (req, res, next) => {
    try {
      await authController.forgotPassword(req.body.email);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }
);

// Reset password route
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validate,
  async (req, res, next) => {
    try {
      await authController.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
);

// Protected routes (require authentication)

// Logout route
router.post(
  '/logout',
  [auth(), body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  async (req, res, next) => {
    try {
      await authController.logout(req.body.refreshToken);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// Send verification email route
router.post('/send-verification-email', auth(), async (req, res, next) => {
  try {
    await authController.sendVerificationEmail(req.user.uid);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Verify email route
router.post(
  '/verify-email',
  [query('token').notEmpty().withMessage('Token is required')],
  validate,
  async (req, res, next) => {
    try {
      await authController.verifyEmail(req.query.token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
