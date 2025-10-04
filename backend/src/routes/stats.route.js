// src/routes/stats.route.js
const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate } = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/apiResponse');

// Get user statistics
router.get('/', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const userId = req.user.id;

    // Get user's songs
    const userSongs = await database.getUserPlaylists(userId);
    const songs = await database.getAllSongs();
    const userCreatedSongs = songs.filter((song) => song.createdBy === userId);

    // Get user's playlists
    const playlists = await database.getUserPlaylists(userId);

    // Get user's recently played
    const recentlyPlayed = (await database.get(`users/${userId}/recentlyPlayed`)) || { songs: [] };

    // Get user's favorites
    const favorites = (await database.get(`users/${userId}/favorites`)) || { songIds: [] };

    // Calculate statistics
    const stats = {
      profile: {
        totalPlaylists: playlists.length,
        totalSongsCreated: userCreatedSongs.length,
        totalFavoriteSongs: favorites.songIds.length,
        memberSince: req.user.createdAt,
      },
      listening: {
        totalSongsPlayed: recentlyPlayed.songs.length,
        uniqueSongsPlayed: new Set(recentlyPlayed.songs.map((item) => item.songId)).size,
        totalPlayTime: recentlyPlayed.songs.reduce((total, item) => {
          return total + (item.lastPlayDuration || 0);
        }, 0),
      },
      activity: {
        lastActive: recentlyPlayed.updatedAt || req.user.updatedAt,
        mostPlayedSong: null,
        favoriteGenres: [],
      },
    };

    // Find most played song
    if (recentlyPlayed.songs.length > 0) {
      const songPlayCounts = {};
      recentlyPlayed.songs.forEach((item) => {
        songPlayCounts[item.songId] = (songPlayCounts[item.songId] || 0) + 1;
      });

      const mostPlayedSongId = Object.keys(songPlayCounts).reduce((a, b) =>
        songPlayCounts[a] > songPlayCounts[b] ? a : b
      );

      const mostPlayedSong = await database.getSong(mostPlayedSongId);
      if (mostPlayedSong) {
        stats.activity.mostPlayedSong = {
          ...mostPlayedSong,
          playCount: songPlayCounts[mostPlayedSongId],
        };
      }
    }

    // Calculate favorite genres
    const genreCounts = {};
    for (const songId of favorites.songIds) {
      const song = await database.getSong(songId);
      if (song && song.genre) {
        genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
      }
    }

    stats.activity.favoriteGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    apiResponse.success(stats, 'User statistics retrieved successfully');
  } catch (error) {
    console.error('Get user stats error:', error);
    apiResponse.serverError('Failed to retrieve user statistics');
  }
});

// Get user's top songs (by play count)
router.get('/top-songs', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { limit = 10 } = req.query;

    const recentlyPlayed = (await database.get(`users/${req.user.id}/recentlyPlayed`)) || {
      songs: [],
    };

    // Count plays per song
    const songPlayCounts = {};
    recentlyPlayed.songs.forEach((item) => {
      songPlayCounts[item.songId] = (songPlayCounts[item.songId] || 0) + 1;
    });

    // Get top songs
    const topSongIds = Object.entries(songPlayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, parseInt(limit))
      .map(([songId]) => songId);

    const topSongs = [];
    for (const songId of topSongIds) {
      const song = await database.getSong(songId);
      if (song) {
        topSongs.push({
          ...song,
          playCount: songPlayCounts[songId],
        });
      }
    }

    apiResponse.success(topSongs, 'Top songs retrieved successfully');
  } catch (error) {
    console.error('Get top songs error:', error);
    apiResponse.serverError('Failed to retrieve top songs');
  }
});

// Get user's listening trends
router.get('/trends', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const recentlyPlayed = (await database.get(`users/${req.user.id}/recentlyPlayed`)) || {
      songs: [],
    };

    // Group by day
    const dailyPlays = {};
    recentlyPlayed.songs.forEach((item) => {
      const date = new Date(item.playedAt).toDateString();
      dailyPlays[date] = (dailyPlays[date] || 0) + 1;
    });

    // Get last 7 days
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      trends.push({
        date: dateString,
        plays: dailyPlays[dateString] || 0,
      });
    }

    apiResponse.success(trends, 'Listening trends retrieved successfully');
  } catch (error) {
    console.error('Get listening trends error:', error);
    apiResponse.serverError('Failed to retrieve listening trends');
  }
});

module.exports = router;
