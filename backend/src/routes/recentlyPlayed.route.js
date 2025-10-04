// src/routes/recentlyPlayed.route.js
const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate } = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/apiResponse');

// Get user's recently played songs
router.get('/', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { limit = 20 } = req.query;

    const recentlyPlayed = await database.get(`users/${req.user.id}/recentlyPlayed`);
    if (!recentlyPlayed || !recentlyPlayed.songs) {
      return apiResponse.success([], 'No recently played songs found');
    }

    // Get the most recent songs
    const recentSongs = recentlyPlayed.songs
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, parseInt(limit));

    const songsWithData = [];
    for (const item of recentSongs) {
      const song = await database.getSong(item.songId);
      if (song) {
        songsWithData.push({
          ...song,
          playedAt: item.playedAt,
          playCount: item.playCount || 1,
        });
      }
    }

    apiResponse.success(songsWithData, 'Recently played songs retrieved successfully');
  } catch (error) {
    console.error('Get recently played error:', error);
    apiResponse.serverError('Failed to retrieve recently played songs');
  }
});

// Track song play event
router.post('/:songId', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { songId } = req.params;
    const { playDuration } = req.body;

    // Check if song exists
    const song = await database.getSong(songId);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    // Get current recently played
    const recentlyPlayed = (await database.get(`users/${req.user.id}/recentlyPlayed`)) || {
      songs: [],
    };

    // Find existing entry or create new one
    const existingIndex = recentlyPlayed.songs.findIndex((item) => item.songId === songId);

    const playData = {
      songId,
      playedAt: new Date().toISOString(),
      playCount: 1,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      recentlyPlayed.songs[existingIndex].playedAt = playData.playedAt;
      recentlyPlayed.songs[existingIndex].playCount += 1;
      if (playDuration) {
        recentlyPlayed.songs[existingIndex].lastPlayDuration = playDuration;
      }
    } else {
      // Add new entry
      if (playDuration) {
        playData.lastPlayDuration = playDuration;
      }
      recentlyPlayed.songs.push(playData);
    }

    // Keep only the most recent 100 songs
    recentlyPlayed.songs = recentlyPlayed.songs
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, 100);

    recentlyPlayed.updatedAt = new Date().toISOString();

    await database.set(`users/${req.user.id}/recentlyPlayed`, recentlyPlayed);

    apiResponse.success(playData, 'Play event tracked successfully');
  } catch (error) {
    console.error('Track play event error:', error);
    apiResponse.serverError('Failed to track play event');
  }
});

// Clear recently played
router.delete('/', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    await database.set(`users/${req.user.id}/recentlyPlayed`, { songs: [] });

    apiResponse.success(null, 'Recently played history cleared successfully');
  } catch (error) {
    console.error('Clear recently played error:', error);
    apiResponse.serverError('Failed to clear recently played history');
  }
});

module.exports = router;
