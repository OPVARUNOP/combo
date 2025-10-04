const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, playlistRules } = require('../middleware/validation.middleware');
const ApiResponse = require('../utils/apiResponse');

router.get('/', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const playlists = await database.getAllPlaylists();
    apiResponse.success(playlists, 'Playlists retrieved successfully');
  } catch (error) {
    console.error('Get playlists error:', error);
    apiResponse.serverError('Failed to retrieve playlists');
  }
});

router.get('/:id', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const playlist = await database.getPlaylist(req.params.id);
    if (!playlist) {
      return apiResponse.notFound('Playlist not found');
    }

    apiResponse.success(playlist, 'Playlist retrieved successfully');
  } catch (error) {
    console.error('Get playlist error:', error);
    apiResponse.serverError('Failed to retrieve playlist');
  }
});

router.post('/', authenticate, validate(playlistRules()), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { name, description, isPublic } = req.body;

    const playlist = await database.createPlaylist({
      name,
      description,
      isPublic: isPublic || false,
      createdBy: req.user.id,
      songs: [],
    });

    apiResponse.created(playlist, 'Playlist created successfully');
  } catch (error) {
    console.error('Create playlist error:', error);
    apiResponse.serverError('Failed to create playlist');
  }
});

router.post('/:id/songs', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { songId } = req.body;

    if (!songId) {
      return apiResponse.error('Song ID is required', 400);
    }

    const playlist = await database.getPlaylist(req.params.id);
    if (!playlist) {
      return apiResponse.notFound('Playlist not found');
    }

    // Check if user owns the playlist or it's public
    if (playlist.createdBy !== req.user.id && !playlist.isPublic) {
      return apiResponse.forbidden(
        'You can only add songs to your own playlists or public playlists'
      );
    }

    // Check if song exists
    const song = await database.getSong(songId);
    if (!song) {
      return apiResponse.notFound('Song not found');
    }

    await database.addSongToPlaylist(req.params.id, songId);

    const updatedPlaylist = await database.getPlaylist(req.params.id);
    apiResponse.success(updatedPlaylist, 'Song added to playlist successfully');
  } catch (error) {
    console.error('Add song to playlist error:', error);
    apiResponse.serverError('Failed to add song to playlist');
  }
});

router.delete('/:id/songs/:songId', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const playlist = await database.getPlaylist(req.params.id);
    if (!playlist) {
      return apiResponse.notFound('Playlist not found');
    }

    // Check if user owns the playlist
    if (playlist.createdBy !== req.user.id) {
      return apiResponse.forbidden('You can only remove songs from your own playlists');
    }

    await database.removeSongFromPlaylist(req.params.id, req.params.songId);

    const updatedPlaylist = await database.getPlaylist(req.params.id);
    apiResponse.success(updatedPlaylist, 'Song removed from playlist successfully');
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    apiResponse.serverError('Failed to remove song from playlist');
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const playlist = await database.getPlaylist(req.params.id);
    if (!playlist) {
      return apiResponse.notFound('Playlist not found');
    }

    // Check if user owns the playlist or is admin
    if (playlist.createdBy !== req.user.id && req.user.role !== 'admin') {
      return apiResponse.forbidden('You can only delete your own playlists');
    }

    await database.deletePlaylist(req.params.id);
    apiResponse.success(null, 'Playlist deleted successfully');
  } catch (error) {
    console.error('Delete playlist error:', error);
    apiResponse.serverError('Failed to delete playlist');
  }
});

module.exports = router;
