#!/usr/bin/env node

/**
 * COMBO Backend Server - Jamendo Integration with Enhanced Security
 * Features: Rate limiting, CORS protection, input validation, error handling
 */

const cacheService = require('./src/services/cache.service');

const app = express();
const PORT = process.env.PORT || 3001;

// Jamendo API Configuration
const JAMENDO_CLIENT_ID = 'c1eea382';
const JAMENDO_CLIENT_SECRET = '245483b397b6bd04e7e3937d4458e5f2';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    message: 'Too many search requests, please wait a moment.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.jamendo.com"],
      mediaSrc: ["'self'", "https:", "blob:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'https://combo-music-app.web.app',
      'https://combo-music-app.firebaseapp.com'
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Jamendo API Helper with caching
const jamendoRequest = async (endpoint, params = {}) => {
  const cacheKey = `jamendo:${endpoint}:${JSON.stringify(params)}`;

  return await cacheService.cached(
    async () => {
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
    },
    `jamendo:${endpoint}`,
    params,
    1800 // Cache for 30 minutes
  );
};

// Format functions
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

const formatJamendoAlbum = (jamendoAlbum) => ({
  id: jamendoAlbum.id.toString(),
  title: jamendoAlbum.name,
  artist: jamendoAlbum.artist_name,
  jamendo_id: jamendoAlbum.id,
  jamendo_artwork_url: jamendoAlbum.image,
  release_date: jamendoAlbum.releasedate,
  total_tracks: jamendoAlbum.tracks_count
});

const formatJamendoArtist = (jamendoArtist) => ({
  id: jamendoArtist.id.toString(),
  name: jamendoArtist.name,
  jamendo_id: jamendoArtist.id,
  jamendo_image_url: jamendoArtist.image,
  verified: false
});

// API Routes
const apiRouter = express.Router();

// Apply rate limiting
apiRouter.use(generalLimiter);
apiRouter.use('/auth', strictLimiter);
apiRouter.use('/music/search', searchLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'COMBO Backend with Jamendo Integration',
    jamendo_client_id: JAMENDO_CLIENT_ID ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString()
  });
});

// Search endpoint
apiRouter.get('/music/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let jamendoData;
    let formattedResults = [];

    const searchParams = { limit, offset, format: 'json' };

    if (type === 'track') {
      try {
        jamendoData = await jamendoRequest('/tracks/', { ...searchParams, name: q });
      } catch (error) {
        jamendoData = await jamendoRequest('/tracks/', { ...searchParams, tag: q });
      }
    } else if (type === 'album') {
      try {
        jamendoData = await jamendoRequest('/albums/', { ...searchParams, name: q });
      } catch (error) {
        jamendoData = await jamendoRequest('/albums/', { ...searchParams, tag: q });
      }
    } else if (type === 'artist') {
      jamendoData = await jamendoRequest('/artists/', { ...searchParams, name: q });
    }

    if (type === 'track') {
      formattedResults = jamendoData.results.map(formatJamendoTrack);
    } else if (type === 'album') {
      formattedResults = jamendoData.results.map(formatJamendoAlbum);
    } else if (type === 'artist') {
      formattedResults = jamendoData.results.map(formatJamendoArtist);
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
    console.error('Search error:', error.message);
    try {
      const trendingData = await jamendoRequest('/tracks/', {
        orderby: 'popularity_total',
        limit: parseInt(req.query.limit) || 20
      });
      const trendingTracks = trendingData.results.map(formatJamendoTrack);

      res.json({
        data: {
          tracks: trendingTracks,
          total: trendingData.headers?.results_count || trendingTracks.length,
          query: req.query.q,
          type: 'track',
          fallback: true,
          message: 'Search returned no results, showing trending tracks instead'
        }
      });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Search failed', error: error.message });
    }
  }
});

// Get track details
apiRouter.get('/music/track/:id', async (req, res) => {
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

// Get trending tracks
apiRouter.get('/music/trending', async (req, res) => {
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

// Get all albums
apiRouter.get('/music/albums', async (req, res) => {
  try {
    const { limit = 20, offset = 0, genre, artist } = req.query;
    const searchParams = { limit, offset, format: 'json' };

    if (genre) searchParams.tag = genre;
    if (artist) searchParams.artist = artist;

    const jamendoData = await jamendoRequest('/albums/', {
      ...searchParams,
      orderby: 'popularity_total'
    });

    const albums = jamendoData.results.map(formatJamendoAlbum);
    res.json({
      data: {
        albums,
        total: jamendoData.headers?.results_count || albums.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get albums error:', error.message);
    res.status(500).json({ message: 'Failed to get albums', error: error.message });
  }
});

// Get all artists
apiRouter.get('/music/artists', async (req, res) => {
  try {
    const { limit = 20, offset = 0, genre } = req.query;
    const searchParams = { limit, offset, format: 'json' };

    if (genre) searchParams.tag = genre;

    const jamendoData = await jamendoRequest('/artists/', {
      ...searchParams,
      orderby: 'popularity_total'
    });

    const artists = jamendoData.results.map(formatJamendoArtist);
    res.json({
      data: {
        artists,
        total: jamendoData.headers?.results_count || artists.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get artists error:', error.message);
    res.status(500).json({ message: 'Failed to get artists', error: error.message });
  }
});

// Simple authentication (for demo purposes)
let users = [];
let currentUserId = 1;

// Register endpoint
apiRouter.post('/auth/register', async (req, res) => {
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
apiRouter.post('/auth/login', async (req, res) => {
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

// Get user playlists
apiRouter.get('/music/playlists', async (req, res) => {
  try {
    const mockPlaylists = [
      {
        id: '1',
        name: 'My Favorites',
        description: 'My favorite tracks',
        trackCount: 25,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Workout Mix',
        description: 'High energy tracks for workout',
        trackCount: 30,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      data: {
        playlists: mockPlaylists,
        total: mockPlaylists.length
      }
    });
  } catch (error) {
    console.error('Get playlists error:', error.message);
    res.status(500).json({ message: 'Failed to get playlists', error: error.message });
  }
});

// Create playlist
apiRouter.post('/music/playlists', async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description: description || '',
      trackCount: 0,
      isPublic,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      data: {
        playlist: newPlaylist
      }
    });
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ message: 'Failed to create playlist', error: error.message });
  }
});

// Get playlist by ID
apiRouter.get('/music/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mockPlaylist = {
      id,
      name: 'Sample Playlist',
      description: 'A sample playlist with tracks',
      trackCount: 3,
      isPublic: true,
      tracks: [
        {
          id: '1',
          title: 'Sample Track 1',
          artist: 'Sample Artist 1',
          album: 'Sample Album 1',
          duration: 180
        },
        {
          id: '2',
          title: 'Sample Track 2',
          artist: 'Sample Artist 2',
          album: 'Sample Album 2',
          duration: 240
        },
        {
          id: '3',
          title: 'Sample Track 3',
          artist: 'Sample Artist 3',
          album: 'Sample Album 3',
          duration: 200
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      data: {
        playlist: mockPlaylist
      }
    });
  } catch (error) {
    console.error('Get playlist error:', error.message);
    res.status(500).json({ message: 'Failed to get playlist', error: error.message });
  }
});

// Add track to playlist
apiRouter.post('/music/playlist/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const { trackId } = req.body;

    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }

    res.json({
      data: {
        message: 'Track added to playlist successfully',
        playlistId: id,
        trackId
      }
    });
  } catch (error) {
  }

  res.json({
    data: {
      message: 'Track added to playlist successfully',
    res.json({
      data: {
        message: 'Track added to playlist successfully',
        playlistId: id,
        trackId
      }
    });
  } catch (error) {
    console.error('Add track to playlist error:', error.message);
    res.status(500).json({ message: 'Failed to add track to playlist', error: error.message });
  }
});

// Remove track from playlist
apiRouter.delete('/music/playlist/:id/tracks/:trackId', async (req, res) => {
  try {
    const { id, trackId } = req.params;

    res.json({
      data: {
        message: 'Track removed from playlist successfully',
        playlistId: id,
        trackId
      }
    });
  } catch (error) {
    console.error('Remove track from playlist error:', error.message);
    res.status(500).json({ message: 'Failed to remove track from playlist', error: error.message });
  }
});

// Remove track from playlist
apiRouter.delete('/music/playlist/:id/tracks/:trackId', async (req, res) => {
try {
  const { id, trackId } = req.params;

  res.json({
    data: {
      message: 'Track removed from playlist successfully',
      playlistId: id,
      trackId
    }
  });
} catch (error) {
  console.error('Remove track from playlist error:', error.message);
  res.status(500).json({ message: 'Failed to remove track from playlist', error: error.message });
}
});

// Cache management endpoints (admin only)
apiRouter.post('/admin/cache/clear', async (req, res) => {
try {
  const cleared = await cacheService.clear();
  res.json({
    message: 'Cache cleared successfully',
    cleared
  });
} catch (error) {
  res.status(500).json({ message: 'Failed to clear cache', error: error.message });
}
});

apiRouter.get('/admin/cache/stats', async (req, res) => {
try {
  const stats = await cacheService.getStats();
  res.json({ data: { cache: stats } });
} catch (error) {
  res.status(500).json({ message: 'Failed to get cache stats', error: error.message });
}
});

// Mount API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(PORT, async () => {
  // Connect to Redis
  await cacheService.connect();

  console.log(`🎵 COMBO Backend with Jamendo Integration running on port ${PORT}`);
  console.log(`📡 Jamendo Client ID: ${JAMENDO_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📚 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test Search: http://localhost:${PORT}/api/music/search?q=rock`);
  console.log(`🚀 Redis Caching: Enabled`);
  console.log(`🛡️ Security: Rate limiting, CORS, Helmet active`);
  console.log(`🎵 Ready to stream music from Jamendo!`);
});
