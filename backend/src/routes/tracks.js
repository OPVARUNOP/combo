const express = require('express');
const { check } = require('express-validator');
const trackController = require('../controllers/trackController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', trackController.getTracks);
router.get('/:id', trackController.getTrackById);

// Protected routes
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('audioUrl', 'Audio URL is required').not().isEmpty(),
      check('duration', 'Duration is required').isNumeric(),
    ],
  ],
  trackController.createTrack
);

router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('audioUrl', 'Audio URL is required').not().isEmpty(),
      check('duration', 'Duration is required').isNumeric(),
    ],
  ],
  trackController.updateTrack
);

router.delete('/:id', auth, trackController.deleteTrack);

// Like/Unlike routes
router.put('/like/:id', auth, trackController.likeTrack);
router.put('/unlike/:id', auth, trackController.unlikeTrack);

module.exports = router;
