const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, songRules } = require('../middleware/validation.middleware');
const ApiResponse = require('../utils/apiResponse');

router.get('/', async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { search, artist, genre } = req.query;

    let songs;
    if (search) {
      songs = await database.searchSongs(search);
    } else if (artist) {
      songs = await database.getSongsByArtist(artist);
    } else if (genre) {
      songs = await database.getSongsByGenre(genre);
    } else {
      songs = await database.getAllSongs();
    }

    apiResponse.success(songs, 'Songs retrieved successfully');
  } catch (error) {
    console.error('Get songs error:', error);
    apiResponse.serverError('Failed to retrieve songs');
  }
});

router.get('/:id', async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const song = await database.getSong(req.params.id);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    apiResponse.success(song, 'Song retrieved successfully');
  } catch (error) {
    console.error('Get song error:', error);
    apiResponse.serverError('Failed to retrieve song');
  }
});

router.post('/', authenticate, validate(songRules()), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { title, artist, duration, genre, album } = req.body;

    const song = await database.createSong({
      title,
      artist,
      duration,
      genre,
      album,
      createdBy: req.user.id,
    });

    apiResponse.created(song, 'Song created successfully');
  } catch (error) {
    console.error('Create song error:', error);
    apiResponse.serverError('Failed to create song');
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const song = await database.getSong(req.params.id);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    // Check if user is the creator or an admin
    if (song.createdBy !== req.user.id && req.user.role !== 'admin') {
      return apiResponse.forbidden('You can only edit your own songs');
    }

    const { title, artist, duration, genre, album } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (duration) updates.duration = duration;
    if (genre) updates.genre = genre;
    if (album) updates.album = album;

    await database.updateSong(req.params.id, updates);

    const updatedSong = await database.getSong(req.params.id);
    apiResponse.success(updatedSong, 'Song updated successfully');
  } catch (error) {
    console.error('Update song error:', error);
    apiResponse.serverError('Failed to update song');
  }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const song = await database.getSong(req.params.id);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    await database.deleteSong(req.params.id);
    apiResponse.success(null, 'Song deleted successfully');
  } catch (error) {
    console.error('Delete song error:', error);
    apiResponse.serverError('Failed to delete song');
  }
});

module.exports = router;
