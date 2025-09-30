# 🎵 COMBO + Jamendo Integration Guide

## 🔄 New Architecture: Backend as Middleman

Your COMBO app now uses a **backend middleman** that communicates with Jamendo API. This approach provides:

✅ **Security** - API keys stay on your backend, not exposed to mobile app
✅ **Flexibility** - Easy to switch between music APIs (Jamendo, SoundCloud, etc.)
✅ **Control** - You control data formatting and caching
✅ **Analytics** - Track user behavior and preferences
✅ **Legal Compliance** - Centralized license and usage management

## 📡 API Flow

### **Before (Direct API):**
```
Mobile App → Jamendo API (API key exposed)
```

### **After (Backend Middleman):**
```
Mobile App → Your Backend API → Jamendo API (API key secure)
```

## 🚀 Backend Implementation Required

Your backend needs to implement these endpoints:

### **1. Search Endpoint**
```javascript
// GET /search?q={query}&type=track
app.get('/search', async (req, res) => {
  const { q, type, limit = 20, offset = 0 } = req.query;

  // Call Jamendo API
  const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
    params: {
      client_id: 'YOUR_JAMENDO_API_KEY',
      search: q,
      limit,
      offset,
      format: 'json'
    }
  });

  // Format response for mobile app
  const formattedTracks = response.data.results.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artist_name,
    album: track.album_name,
    duration: track.duration,
    artwork_url: track.album_image,
    audio_url_low: track.audio, // Jamendo provides streaming URL
    genre: track.genre,
    release_date: track.releasedate
  }));

  res.json({
    data: {
      tracks: formattedTracks,
      total: response.data.headers.results_count
    }
  });
});
```

### **2. Track Streaming Endpoint**
```javascript
// GET /tracks/{id}/stream
app.get('/tracks/:id/stream', async (req, res) => {
  const { id } = req.params;

  // Get track details from Jamendo
  const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
    params: {
      client_id: 'YOUR_JAMENDO_API_KEY',
      id,
      format: 'json'
    }
  });

  if (response.data.results.length === 0) {
    return res.status(404).json({ message: 'Track not found' });
  }

  const track = response.data.results[0];

  // Return the streaming URL directly
  res.json({
    data: {
      stream_url: track.audio, // Jamendo's streaming URL
      duration: track.duration,
      title: track.name,
      artist: track.artist_name
    }
  });
});
```

### **3. Authentication Endpoints**
```javascript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Your authentication logic
  // Verify user credentials
  // Generate JWT token

  res.json({
    data: {
      user: userData,
      accessToken: 'jwt_token_here',
      refreshToken: 'refresh_token_here'
    }
  });
});
```

## 🎵 Jamendo API Endpoints You'll Use

### **Tracks:**
```
GET https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_KEY&search=rock
GET https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_KEY&id=12345
```

### **Albums:**
```
GET https://api.jamendo.com/v3.0/albums/?client_id=YOUR_KEY
GET https://api.jamendo.com/v3.0/albums/tracks/?client_id=YOUR_KEY&id=67890
```

### **Artists:**
```
GET https://api.jamendo.com/v3.0/artists/?client_id=YOUR_KEY
GET https://api.jamendo.com/v3.0/artists/tracks/?client_id=YOUR_KEY&id=11111
```

### **Playlists:**
```
GET https://api.jamendo.com/v3.0/playlists/?client_id=YOUR_KEY
```

### **Genres:**
```
GET https://api.jamendo.com/v3.0/genres/?client_id=YOUR_KEY
```

## 📱 Mobile App Changes

The mobile app now calls your backend instead of external APIs:

### **Before:**
```javascript
// Direct Jamendo call (insecure)
const response = await fetch('https://api.jamendo.com/v3.0/tracks/?client_id=EXPOSED_KEY&search=rock');
```

### **After:**
```javascript
// Call your secure backend
const response = await trackAPI.search('rock', { limit: 20 });
```

## 🔧 Backend Setup Steps

### **1. Get Jamendo API Key:**
1. Go to https://developer.jamendo.com/
2. Sign up for a free account
3. Get your `client_id` (API key)
4. Test with: `https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_KEY&search=test`

### **2. Backend Routes to Implement:**

#### **Search Route:**
```javascript
app.get('/search', jamendoSearchHandler);
```

#### **Track Details:**
```javascript
app.get('/tracks/:id', jamendoTrackHandler);
app.get('/tracks/:id/stream', jamendoStreamHandler);
```

#### **Albums:**
```javascript
app.get('/albums/:id', jamendoAlbumHandler);
```

#### **Artists:**
```javascript
app.get('/artists/:id', jamendoArtistHandler);
app.get('/artists/:id/top-tracks', jamendoArtistTopTracksHandler);
```

### **3. Response Formatting:**

Your backend should format Jamendo responses to match the mobile app's expected format:

```javascript
// Jamendo response format
{
  "headers": { "status": "success", "results_count": 25 },
  "results": [
    {
      "id": "12345",
      "name": "Song Title",
      "artist_name": "Artist Name",
      "album_name": "Album Name",
      "duration": 180,
      "audio": "https://mp3d.jamendo.com/?trackid=12345&format=mp32",
      "album_image": "https://imgjam1.jamendo.com/albums/s123/12345/covers/1.200.jpg"
    }
  ]
}

// Your backend formatted response
{
  "data": {
    "tracks": [
      {
        "id": "12345",
        "title": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name",
        "duration": 180,
        "audio_url_medium": "https://mp3d.jamendo.com/?trackid=12345&format=mp32",
        "artwork_url": "https://imgjam1.jamendo.com/albums/s123/12345/covers/1.200.jpg"
      }
    ]
  }
}
```

## 🎯 Jamendo API Features

### **Free Tier Limits:**
- 30 requests per minute
- Search results limited to 200 per query
- Perfect for development and small-scale apps

### **Music Quality:**
- MP3 format (128kbps - 320kbps)
- Direct streaming URLs
- Album artwork in multiple sizes
- Rich metadata (genre, mood, instruments)

### **Content Types:**
- **Tracks**: 600,000+ songs
- **Albums**: 40,000+ albums
- **Artists**: 40,000+ artists
- **Playlists**: Curated collections
- **Genres**: Music categorization

## 🚀 Quick Start Backend

### **Node.js/Express Example:**
```javascript
const express = require('express');
const axios = require('axios');
const app = express();

const JAMENDO_API_KEY = 'YOUR_JAMENDO_CLIENT_ID';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;

    const response = await axios.get(`${JAMENDO_BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_API_KEY,
        search: q,
        limit,
        format: 'json'
      }
    });

    // Format for mobile app
    const tracks = response.data.results.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      duration: track.duration,
      artwork_url: track.album_image,
      audio_url_medium: track.audio
    }));

    res.json({ data: { tracks } });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});

app.listen(3000, () => {
  console.log('COMBO Backend running on port 3000');
});
```

## 📈 Scaling Considerations

### **Caching:**
- Cache Jamendo responses (Redis/Memory)
- Cache popular searches
- Cache frequently accessed tracks

### **Rate Limiting:**
- Implement rate limiting on your backend
- Monitor Jamendo API usage
- Handle API failures gracefully

### **Error Handling:**
- Fallback for Jamendo API failures
- Retry logic for failed requests
- User-friendly error messages

## 🎵 Benefits of This Architecture

✅ **Secure** - API keys never exposed to mobile app
✅ **Flexible** - Easy to switch music providers
✅ **Scalable** - Add caching, rate limiting, analytics
✅ **Legal** - Centralized license management
✅ **Maintainable** - Single point of integration
✅ **Analytics** - Track user behavior and preferences

---

**Next Steps:**
1. Get your Jamendo API key
2. Implement the backend routes above
3. Test the search functionality
4. Add streaming support
5. Scale with caching and error handling

Your COMBO app is now ready for legal, free music streaming with Jamendo! 🎉
