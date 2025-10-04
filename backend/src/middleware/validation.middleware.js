const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

const registerRules = () => [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
];

const loginRules = () => [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const songRules = () => [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Artist is required')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters'),
];

const playlistRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Playlist name is required')
    .isLength({ max: 100 })
    .withMessage('Playlist name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  songRules,
  playlistRules,
};
