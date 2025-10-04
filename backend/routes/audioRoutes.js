const express = require('express');
const router = express.Router();
const audioService = require('../services/audioService');
const storageService = require('../src/services/storage.service');
const bucket = storageService.bucket;
const path = require('path');
const SUPPORTED_FORMATS = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
};
const { validateSongId } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for audio streaming
const streamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
});

/**
 * @route GET /api/audio/stream/:songId
 * @desc Stream audio file with support for range requests
 * @access Public
 */
router.get('/stream/:songId', validateSongId, streamLimiter, async (req, res) => {
  try {
    const { songId } = req.params;
    const range = req.headers.range;

    // Get the audio stream and metadata
    const { stream, headers } = await audioService.getAudioStream(songId, {
      start: range ? parseInt(range.replace(/\D/g, '')) : undefined,
      end: range ? undefined : undefined,
    });

    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // If this is a range request, send 206 Partial Content
    if (range) {
      res.status(206);
    }

    // Pipe the audio stream to the response
    stream.pipe(res);

    // Handle stream errors
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming audio' });
      }
    });
  } catch (error) {
    console.error('Stream error:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({
      error: error.message || 'Failed to stream audio',
      code: error.code,
    });
  }
});

/**
 * @route GET /api/audio/info/:songId
 * @desc Get audio file metadata
 * @access Public
 */
router.get('/info/:songId', validateSongId, async (req, res) => {
  try {
    const { songId } = req.params;
    const info = await audioService.getPlaybackInfo(songId);

    // Cache the response for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(info);
  } catch (error) {
    console.error('Error getting audio info:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({
      error: error.message || 'Failed to get audio info',
      code: error.code,
    });
  }
});

// Initialize playback session
router.post('/session/start', async (req, res) => {
  try {
    const { songId } = req.body;
    const sessionId = await audioService.generateSessionId();
    // Additional session initialization logic can go here
    res.json({ sessionId });
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Failed to initialize playback session' });
  }
});

// Cleanup session
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    await audioService.cleanupSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error cleaning up session:', error);
    res.status(500).json({ error: 'Failed to clean up session' });
  }
});

/**
 * @route POST /api/audio/session/start
 * @desc Start a new playback session
 * @access Private
 */
router.post('/session/start', async (req, res) => {
  try {
    const { songId, quality = 'high' } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'songId is required' });
    }

    const sessionId = await audioService.generateSessionId();

    // In a real app, you might want to track the session in a database
    // and associate it with the user's account

    res.status(201).json({
      sessionId,
      message: 'Playback session started',
      quality,
    });
  } catch (error) {
    console.error('Error starting playback session:', error);
    res.status(500).json({
      error: 'Failed to start playback session',
      details: error.message,
    });
  }
});

/**
 * @route POST /api/audio/session/end
 * @desc End a playback session
 * @access Private
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Clean up session resources
    await audioService.cleanupSession(sessionId);

    res.json({
      success: true,
      message: 'Playback session ended',
    });
  } catch (error) {
    console.error('Error ending playback session:', error);
    res.status(500).json({
      error: 'Failed to end playback session',
      details: error.message,
    });
  }
});

/**
 * @route GET /api/audio/formats/:songId
 * @desc Get available formats for a song
 * @access Public
 */
router.get('/formats/:songId', validateSongId, async (req, res) => {
  try {
    const { songId } = req.params;
    const files = await bucket.getFiles({
      prefix: `songs/${songId}.`,
    });

    const formats = files[0]
      .map((file) => {
        const ext = path.extname(file.name).toLowerCase().substring(1);
        if (SUPPORTED_FORMATS[ext]) {
          return {
            format: ext,
            mimeType: SUPPORTED_FORMATS[ext],
            url: `/api/audio/stream/${songId}?format=${ext}`,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No supported formats found' });
    }

    res.json({ formats });
  } catch (error) {
    console.error('Error getting available formats:', error);
    res.status(500).json({
      error: 'Failed to get available formats',
      details: error.message,
    });
  }
});

/**
 * @route GET /api/audio/lyrics/:songId
 * @desc Get lyrics for a song (placeholder)
 * @access Public
 */
router.get('/lyrics/:songId', validateSongId, (req, res) => {
  try {
    // In a real app, you would fetch lyrics from a database or external API
    res.json({
      lyrics: 'Lyrics not available',
      syncType: null,
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({
      error: 'Failed to fetch lyrics',
      details: error.message,
    });
  }
});

// Error handling middleware
router.use((err, req, res) => {
  console.error('Audio route error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = router;
