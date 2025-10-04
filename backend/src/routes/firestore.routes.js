const express = require('express');
const router = express.Router();
const firestoreController = require('../controllers/firestore.controller');
const { validate } = require('../middleware/validate');
const { body, param } = require('express-validator');

// Test connection
router.get('/test', firestoreController.testConnection);

// Create or update document
router.post(
  '/:collection/:id?',
  [
    param('collection').isString().notEmpty(),
    param('id').optional().isString(),
    body('data').isObject().notEmpty(),
  ],
  validate,
  firestoreController.createDocument
);

// Get document
router.get(
  '/:collection/:id',
  [param('collection').isString().notEmpty(), param('id').isString().notEmpty()],
  validate,
  firestoreController.getDocument
);

// Query documents
router.post(
  '/query/:collection',
  [
    param('collection').isString().notEmpty(),
    body('filters').optional().isArray(),
    body('options').optional().isObject(),
  ],
  validate,
  firestoreController.queryDocuments
);

module.exports = router;
