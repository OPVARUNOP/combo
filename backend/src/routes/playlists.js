const express = require('express');
const { check } = require('express-validator');
const playlistController = require('../controllers/playlistController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes (filtered by middleware if needed)
router.get('/', auth, playlistController.getPlaylists);
router.get('/:id', auth, playlistController.getPlaylistById);

// Protected routes
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('isPublic', 'isPublic must be a boolean').optional().isBoolean(),
    ],
  ],
  playlistController.createPlaylist
);

router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('isPublic', 'isPublic must be a boolean').optional().isBoolean(),
    ],
  ],
  playlistController.updatePlaylist
);

router.delete('/:id', auth, playlistController.deletePlaylist);

// Track management routes
router.put(
  '/:id/tracks',
  [auth, [check('trackId', 'Track ID is required').not().isEmpty()]],
  playlistController.addTrackToPlaylist
);

router.delete('/:id/tracks/:trackId', auth, playlistController.removeTrackFromPlaylist);

module.exports = router;
