#!/usr/bin/env node

/**
 * COMBO Jamendo Backend Server
 * Simple Express server that integrates with Jamendo API
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Jamendo API Configuration (using provided credentials)
const JAMENDO_CLIENT_ID = 'c1eea382';
const JAMENDO_CLIENT_SECRET = '245483b397b6bd04e7e3937d4458e5f2';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Middleware
app.use(cors());
app.use(express.json());

// Jamendo API Helper
const jamendoRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${JAMENDO_BASE_URL}${endpoint}`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        client_secret: JAMENDO_CLIENT_SECRET,
        format: 'json',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Jamendo API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch data from Jamendo');
  }
};

// Format Jamendo track for mobile app
const formatJamendoTrack = (jamendoTrack) => ({
  id: jamendoTrack.id.toString(),
  title: jamendoTrack.name,
  artist: jamendoTrack.artist_name,
  album: jamendoTrack.album_name,
  duration: jamendoTrack.duration,
  genre: jamendoTrack.genre,
  jamendo_id: jamendoTrack.id,
  jamendo_audio_url: jamendoTrack.audio,
  jamendo_artwork_url: jamendoTrack.album_image,
  release_date: jamendoTrack.releasedate
});

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Jamendo Backend',
    jamendo_client_id: JAMENDO_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    timestamp: new Date().toISOString()
  });
});

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let jamendoData;
    let formattedResults = [];

    switch (type) {
      case 'track':
        jamendoData = await jamendoRequest('/tracks/', {
          search: q,
          limit,
          offset
        });
        formattedResults = jamendoData.results.map(formatJamendoTrack);
        break;

      case 'album':
        jamendoData = await jamendoRequest('/albums/', {
          search: q,
          limit,
          offset
        });
        formattedResults = jamendoData.results.map(album => ({
          id: album.id.toString(),
          title: album.name,
          artist: album.artist_name,
          jamendo_id: album.id,
          jamendo_artwork_url: album.image,
          release_date: album.releasedate,
          total_tracks: album.tracks_count
        }));
        break;

      case 'artist':
        jamendoData = await jamendoRequest('/artists/', {
          search: q,
          limit,
          offset
        });
        formattedResults = jamendoData.results.map(artist => ({
          id: artist.id.toString(),
          name: artist.name,
          jamendo_id: artist.id,
          jamendo_image_url: artist.image,
          verified: false
        }));
        break;

      default:
        return res.status(400).json({ message: 'Invalid type parameter' });
    }

    res.json({
      data: {
        [type === 'track' ? 'tracks' : type === 'album' ? 'albums' : 'artists']: formattedResults,
        total: jamendoData.headers?.results_count || formattedResults.length,
        query: q,
        type
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Get track details
app.get('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jamendoData = await jamendoRequest('/tracks/', { id });

    if (!jamendoData.results || jamendoData.results.length === 0) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const track = formatJamendoTrack(jamendoData.results[0]);
    res.json({ data: { track } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get track', error: error.message });
  }
});

// Get track streaming URL
app.get('/tracks/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    const jamendoData = await jamendoRequest('/tracks/', { id });

    if (!jamendoData.results || jamendoData.results.length === 0) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const track = jamendoData.results[0];
    res.json({
      data: {
        stream_url: track.audio,
        title: track.name,
        artist: track.artist_name,
        duration: track.duration,
        jamendo_id: track.id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stream URL', error: error.message });
  }
});

// Get album details with tracks
app.get('/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jamendoData = await jamendoRequest('/albums/', { id });

    if (!jamendoData.results || jamendoData.results.length === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const album = {
      id: jamendoData.results[0].id.toString(),
      title: jamendoData.results[0].name,
      artist: jamendoData.results[0].artist_name,
      jamendo_id: jamendoData.results[0].id,
      jamendo_artwork_url: jamendoData.results[0].image,
      release_date: jamendoData.results[0].releasedate,
      total_tracks: jamendoData.results[0].tracks_count
    };

    // Get album tracks
    const tracksData = await jamendoRequest('/albums/tracks/', { id });
    const tracks = tracksData.results.map(formatJamendoTrack);

    res.json({
      data: {
        album: { ...album, tracks }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get album', error: error.message });
  }
});

// Get artist details
app.get('/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jamendoData = await jamendoRequest('/artists/', { id });

    if (!jamendoData.results || jamendoData.results.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artist = {
      id: jamendoData.results[0].id.toString(),
      name: jamendoData.results[0].name,
      jamendo_id: jamendoData.results[0].id,
      jamendo_image_url: jamendoData.results[0].image,
      verified: false
    };

    res.json({ data: { artist } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get artist', error: error.message });
  }
});

// Get trending tracks
app.get('/tracks/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const jamendoData = await jamendoRequest('/tracks/', {
      orderby: 'popularity_total',
      limit
    });

    const tracks = jamendoData.results.map(formatJamendoTrack);
    res.json({ data: { tracks } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get trending tracks', error: error.message });
  }
});

// Get new releases
app.get('/albums/new-releases', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const jamendoData = await jamendoRequest('/albums/', {
      orderby: 'releasedate DESC',
      limit
    });

    const albums = jamendoData.results.map(album => ({
      id: album.id.toString(),
      title: album.name,
      artist: album.artist_name,
      jamendo_id: album.id,
      jamendo_artwork_url: album.image,
      release_date: album.releasedate,
      total_tracks: album.tracks_count
    }));

    res.json({ data: { albums } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get new releases', error: error.message });
  }
});

// Get popular artists
app.get('/artists/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const jamendoData = await jamendoRequest('/artists/', {
      orderby: 'popularity_total',
      limit
    });

    const artists = jamendoData.results.map(artist => ({
      id: artist.id.toString(),
      name: artist.name,
      jamendo_id: artist.id,
      jamendo_image_url: artist.image,
      verified: false
    }));

    res.json({ data: { artists } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get popular artists', error: error.message });
  }
});

// Get tracks by genre
app.get('/tracks/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;
    const jamendoData = await jamendoRequest('/tracks/', {
      tag: genre,
      limit
    });

    const tracks = jamendoData.results.map(formatJamendoTrack);
    res.json({ data: { tracks } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get tracks by genre', error: error.message });
  }
});

// Get popular genres
app.get('/search/genres', async (req, res) => {
  try {
    const jamendoData = await jamendoRequest('/genres/');
    const genres = jamendoData.results.map(genre => genre.name);
    res.json({ data: { genres } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get genres', error: error.message });
  }
});

// Simple authentication (demo)
let users = [];
let currentUserId = 1;

// Register endpoint
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = {
      id: currentUserId++,
      email,
      username,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    res.json({
      data: {
        user: { id: user.id, email: user.email, username: user.username },
        accessToken: 'demo-jwt-token-' + user.id,
        refreshToken: 'demo-refresh-token-' + user.id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      data: {
        user: { id: user.id, email: user.email, username: user.username },
        accessToken: 'demo-jwt-token-' + user.id,
        refreshToken: 'demo-refresh-token-' + user.id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
app.get('/me', async (req, res) => {
  try {
    res.json({
      data: {
        user: {
          id: 1,
          email: 'demo@combo.app',
          username: 'Demo User',
          preferences: {},
          stats: { totalTracks: 0, totalPlaylists: 0 }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler (must be last, catch-all)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 COMBO Jamendo Backend running on port ${PORT}`);
  console.log(`📡 Jamendo Client ID: ${JAMENDO_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📚 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test Search: http://localhost:${PORT}/search?q=rock&type=track&limit=5`);
  console.log(`🎵 Ready to stream music from Jamendo!`);
});
