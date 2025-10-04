# 🎵 COMBO Backend - Jamendo Integration Example

## 🚀 Quick Start Backend Server

This is a minimal Node.js/Express backend that integrates with Jamendo API.

### **backend/server.js**

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Jamendo API Configuration
const JAMENDO_API_KEY = process.env.JAMENDO_CLIENT_ID;
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Middleware
app.use(cors());
app.use(express.json());

// Jamendo API Helper
const jamendoRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${JAMENDO_BASE_URL}${endpoint}`, {
      params: {
        client_id: JAMENDO_API_KEY,
        format: 'json',
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Jamendo API Error:', error.message);
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
  artwork_url: jamendoTrack.album_image,
  audio_url_medium: jamendoTrack.audio,
  release_date: jamendoTrack.releasedate,
});

// Format Jamendo album for mobile app
const formatJamendoAlbum = (jamendoAlbum) => ({
  id: jamendoAlbum.id.toString(),
  title: jamendoAlbum.name,
  artist: jamendoAlbum.artist_name,
  artwork_url: jamendoAlbum.image,
  release_date: jamendoAlbum.releasedate,
  total_tracks: jamendoAlbum.tracks_count,
});

// Format Jamendo artist for mobile app
const formatJamendoArtist = (jamendoArtist) => ({
  id: jamendoArtist.id.toString(),
  name: jamendoArtist.name,
  profile_image_url: jamendoArtist.image,
  verified: false, // Jamendo doesn't provide verification status
});

// API Routes

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20, offset = 0 } = req.query;

    let jamendoData;
    let formattedResults = [];

    switch (type) {
      case 'track':
        jamendoData = await jamendoRequest('/tracks/', {
          search: q,
          limit,
          offset,
        });
        formattedResults = jamendoData.results.map(formatJamendoTrack);
        break;

      case 'album':
        jamendoData = await jamendoRequest('/albums/', {
          search: q,
          limit,
          offset,
        });
        formattedResults = jamendoData.results.map(formatJamendoAlbum);
        break;

      case 'artist':
        jamendoData = await jamendoRequest('/artists/', {
          search: q,
          limit,
          offset,
        });
        formattedResults = jamendoData.results.map(formatJamendoArtist);
        break;

      default:
        return res.status(400).json({ message: 'Invalid type parameter' });
    }

    res.json({
      data: {
        [type === 'track' ? 'tracks' : type === 'album' ? 'albums' : 'artists']: formattedResults,
        total: jamendoData.headers?.results_count || formattedResults.length,
        query: q,
        type,
      },
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stream URL', error: error.message });
  }
});

// Get album details
app.get('/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jamendoData = await jamendoRequest('/albums/', { id });

    if (!jamendoData.results || jamendoData.results.length === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const album = formatJamendoAlbum(jamendoData.results[0]);

    // Get album tracks
    const tracksData = await jamendoRequest('/albums/tracks/', { id });
    const tracks = tracksData.results.map(formatJamendoTrack);

    res.json({
      data: {
        album: { ...album, tracks },
      },
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

    const artist = formatJamendoArtist(jamendoData.results[0]);
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
      limit,
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
      limit,
    });

    const albums = jamendoData.results.map(formatJamendoAlbum);
    res.json({ data: { albums } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get new releases', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Backend is running',
    jamendo_api_key: JAMENDO_API_KEY ? 'Configured' : 'Missing',
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 COMBO Backend running on port ${PORT}`);
  console.log(`📡 Jamendo API Key: ${JAMENDO_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/health`);
});
```

### **backend/.env**

```env
# Jamendo API Configuration
JAMENDO_CLIENT_ID=your_jamendo_client_id_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database (for user data, playlists, etc.)
DATABASE_URL=postgresql://localhost:5432/combo_app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
```

### **backend/package.json**

```json
{
  "name": "combo-backend",
  "version": "1.0.0",
  "description": "COMBO Music Streaming Backend with Jamendo Integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

## 🚀 Quick Start

### **1. Setup:**

```bash
cd backend
npm install
```

### **2. Configure Environment:**

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Jamendo API key
nano .env
```

### **3. Start Server:**

```bash
npm run dev
```

### **4. Test Endpoints:**

```bash
# Health check
curl http://localhost:3000/health

# Search for rock music
curl "http://localhost:3000/search?q=rock&type=track&limit=5"

# Get track details
curl http://localhost:3000/tracks/12345

# Get streaming URL
curl http://localhost:3000/tracks/12345/stream
```

## 📡 API Endpoints Summary

| Endpoint               | Method | Description                  |
| ---------------------- | ------ | ---------------------------- |
| `/health`              | GET    | Server health check          |
| `/search`              | GET    | Search tracks/albums/artists |
| `/tracks/:id`          | GET    | Get track details            |
| `/tracks/:id/stream`   | GET    | Get streaming URL            |
| `/albums/:id`          | GET    | Get album details            |
| `/artists/:id`         | GET    | Get artist details           |
| `/tracks/trending`     | GET    | Get trending tracks          |
| `/albums/new-releases` | GET    | Get new album releases       |

## 🔄 Mobile App Integration

Your mobile app calls these endpoints:

```javascript
// Search
const searchResults = await searchAPI.search('rock', { limit: 20 });

// Get track for streaming
const trackData = await trackAPI.getById('12345');
const streamUrl = await trackAPI.getStreamUrl('12345');

// Play audio
audioPlayer.play(streamUrl);
```

## 🎯 Next Steps

1. **Add Authentication** - Implement user registration/login
2. **Add Database** - Store user data, playlists, liked songs
3. **Add Caching** - Cache Jamendo responses for better performance
4. **Add Error Handling** - Better error responses and retry logic
5. **Add Rate Limiting** - Prevent API abuse
6. **Add Analytics** - Track user behavior

This backend provides a solid foundation for your COMBO music streaming app with Jamendo integration! 🎵
