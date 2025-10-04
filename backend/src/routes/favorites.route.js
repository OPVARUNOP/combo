// src/routes/favorites.route.js
const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate } = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/apiResponse');

// Get user's favorite songs
router.get('/', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const userFavorites = await database.get(`users/${req.user.id}/favorites`);
    if (!userFavorites || !userFavorites.songIds) {
      return apiResponse.success([], 'No favorite songs found');
    }

    const favoriteSongs = [];
    for (const songId of userFavorites.songIds) {
      const song = await database.getSong(songId);
      if (song) {
        favoriteSongs.push(song);
      }
    }

    apiResponse.success(favoriteSongs, 'Favorite songs retrieved successfully');
  } catch (error) {
    console.error('Get favorites error:', error);
    apiResponse.serverError('Failed to retrieve favorites');
  }
});

// Add song to favorites
router.post('/:songId', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { songId } = req.params;

    // Check if song exists
    const song = await database.getSong(songId);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    // Get current favorites
    const userFavorites = (await database.get(`users/${req.user.id}/favorites`)) || { songIds: [] };

    // Check if already in favorites
    if (userFavorites.songIds.includes(songId)) {
      return apiResponse.error('Song already in favorites', 400);
    }

    // Add to favorites
    userFavorites.songIds.push(songId);
    userFavorites.updatedAt = new Date().toISOString();

    await database.set(`users/${req.user.id}/favorites`, userFavorites);

    apiResponse.success(song, 'Song added to favorites successfully');
  } catch (error) {
    console.error('Add to favorites error:', error);
    apiResponse.serverError('Failed to add song to favorites');
  }
});

// Remove song from favorites
router.delete('/:songId', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { songId } = req.params;

    // Get current favorites
    const userFavorites = await database.get(`users/${req.user.id}/favorites`);
    if (!userFavorites || !userFavorites.songIds) {
      return apiResponse.error('Song not in favorites', 404);
    }

    // Remove from favorites
    userFavorites.songIds = userFavorites.songIds.filter((id) => id !== songId);
    userFavorites.updatedAt = new Date().toISOString();

    await database.set(`users/${req.user.id}/favorites`, userFavorites);

    apiResponse.success(null, 'Song removed from favorites successfully');
  } catch (error) {
    console.error('Remove from favorites error:', error);
    apiResponse.serverError('Failed to remove song from favorites');
  }
});

module.exports = router;
