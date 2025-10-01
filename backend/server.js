#!/usr/bin/env node

/**
 * COMBO Backend Server with Firebase Integration
 * Features: Rate limiting, CORS protection, Firebase Authentication
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

// Import our database service
const database = require('./src/services/database.service');
const ApiResponse = require('./src/utils/apiResponse');

// Health check for Firebase services
const checkFirebaseHealth = async () => {
  try {
    // Test database connection
    await database.get('health');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Initialize Express
const app = express();

// Trust proxy for Cloud Run
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Add your production domains here
    ];

    if (allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.web.app') ||
        origin.endsWith('.firebaseapp.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api',
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip
});

app.use(limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const databaseHealth = await checkFirebaseHealth();
    const healthStatus = {
      status: databaseHealth.status === 'healthy' ? 'OK' : 'WARNING',
      timestamp: new Date().toISOString(),
      service: 'COMBO Backend',
      environment: process.env.NODE_ENV || 'development',
      database: databaseHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version
    };

    const statusCode = healthStatus.status === 'OK' ? 200 : 503;
    apiResponse.success(healthStatus, 'Health check completed', statusCode);
  } catch (error) {
    console.error('Health check failed:', error);
    apiResponse.serverError('Service unavailable');
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  const apiResponse = new ApiResponse(res);
  apiResponse.success({
    name: 'COMBO Music Streaming API',
    version: '1.0.0',
    description: 'A music streaming platform API with Firebase integration',
    endpoints: {
      users: '/api/users',
      music: '/api/music',
      playlists: '/api/playlists',
      favorites: '/api/favorites',
      'recently-played': '/api/recently-played',
      stats: '/api/stats',
      health: '/health'
    },
    authentication: 'JWT Bearer token required for protected endpoints'
  }, 'API information retrieved successfully');
});

// Routes
app.use('/api/users', require('./src/routes/user.route'));
app.use('/api/music', require('./src/routes/music.route'));
app.use('/api/playlists', require('./src/routes/playlist.route'));
app.use('/api/favorites', require('./src/routes/favorites.route'));
app.use('/api/recently-played', require('./src/routes/recentlyPlayed.route'));
app.use('/api/stats', require('./src/routes/stats.route'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const apiResponse = new ApiResponse(res);
  apiResponse.serverError('An unexpected error occurred');
});

// 404 handler
app.use((req, res) => {
  const apiResponse = new ApiResponse(res);
  apiResponse.notFound('The requested endpoint does not exist');
});

// Start the server
const PORT = process.env.PORT || 8080;
# Triggering a new build
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log('📡 Health check at: http://0.0.0.0:' + PORT + '/health');
  console.log('📚 API info at: http://0.0.0.0:' + PORT + '/api');
  console.log('🔒 JWT Authentication enabled');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
