#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();
const logger = require('./src/config/logger');

// Initialize Firebase Admin
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  // Log the environment variables for debugging
  logger.info('Environment variables loaded:', {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || 'Not set',
  });

  // Create service account object from environment variables
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
  }

  // Handle both single and double escaped newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') // Replace escaped newlines
    .replace(/^['"](.*)['"]$/, '$1'); // Remove surrounding quotes if present

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  // Log the service account info (without the private key)
  logger.info('Service account info:', {
    projectId: serviceAccount.projectId,
    clientEmail: serviceAccount.clientEmail,
    privateKey: serviceAccount.privateKey ? '***' : 'Not set',
  });

  try {
    // Initialize Firebase with the service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    logger.info('Firebase Admin SDK initialized successfully with config:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }

  // Initialize Firestore
  const db = admin.firestore();

  // Test Firestore connection
  db.collection('test')
    .doc('connection')
    .get()
    .then(() => {
      logger.info('Successfully connected to Firestore');
    })
    .catch((error) => {
      logger.error('Failed to connect to Firestore:', error);
      process.exit(1);
    });

  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

/**
 * COMBO Backend Server with Firebase Integration
 * Features: Rate limiting, CORS protection, Firebase Authentication & Firestore
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('./src/config/config');
const ApiResponse = require('./src/utils/ApiResponse');

// Initialize Express
const app = express();
// Initialize Firebase Service
const firebaseService = require('./src/services/firebase.service');
app.locals.firebaseService = firebaseService;
logger.info('Firebase service initialized');

// Initialize Backblaze B2 Service (optional)
let b2Service = null;

try {
  const B2Service = require('./src/services/b2-service');
  b2Service = new B2Service();

  // Initialize B2 service and make it available in app locals
  b2Service
    .initialize()
    .then(() => {
      app.locals.b2Service = b2Service;
      logger.info('B2 service initialized and attached to app.locals');
    })
    .catch((error) => {
      logger.warn('B2 service initialization failed (continuing without B2):', error.message);
      app.locals.b2Service = null;
    });
} catch (error) {
  logger.warn('B2 service is not available (continuing without B2):', error.message);
  app.locals.b2Service = null;
}

const database = admin.database();

// Health check for services
const checkServicesHealth = async () => {
  const results = {
    b2: { status: 'unknown' },
    timestamp: new Date().toISOString(),
  };

  try {
    // Test database connection
    await database.get('health');
    results.database = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    results.database = {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  // Test B2 connection if available
  if (b2Service) {
    try {
      await b2Service.initialize();
      results.b2 = {
        status: 'healthy',
        bucket: b2Service.bucketName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      results.b2 = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  } else {
    results.b2 = {
      status: 'not_configured',
      message: 'B2 service is not configured',
      timestamp: new Date().toISOString(),
    };
  }

  // Determine overall status
  const allHealthy = Object.values(results)
    .filter((service) => typeof service === 'object' && 'status' in service)
    .every((service) => service.status === 'healthy');

  return {
    ...results,
    status: allHealthy ? 'healthy' : 'degraded',
  };
};

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed origins list or is a Firebase domain
    if (
      config.allowedOrigins.includes(origin) ||
      origin.endsWith('.web.app') ||
      origin.endsWith('.firebaseapp.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
};

app.use(cors(corsOptions));

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
  keyGenerator: (req) => req.ip,
});

app.use(limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const servicesHealth = await checkServicesHealth();
    const healthStatus = {
      status: servicesHealth.status === 'healthy' ? 'OK' : 'WARNING',
      timestamp: new Date().toISOString(),
      service: 'COMBO Backend',
      environment: process.env.NODE_ENV || 'development',
      services: servicesHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version,
    };

    const statusCode = healthStatus.status === 'OK' ? 200 : 503;
    apiResponse.success(healthStatus, 'Health check completed', statusCode);
  } catch (error) {
    console.error('Health check failed:', error);
    apiResponse.serverError('Service unavailable');
  }
});

// Audio routes
const audioRoutes = require('./routes/audioRoutes');
app.use('/api/audio', audioRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  const apiResponse = new ApiResponse(res);
  apiResponse.success(
    {
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
        health: '/health',
      },
      authentication: 'JWT Bearer token required for protected endpoints',
    },
    'API information retrieved successfully'
  );
});

// Routes
app.use('/api/auth', require('./src/routes/auth.route'));
app.use('/api/users', require('./src/routes/user.route'));
app.use('/api/music', require('./src/routes/music.route'));
app.use('/api/playlists', require('./src/routes/playlist.route'));
app.use('/api/favorites', require('./src/routes/favorites.route'));
app.use('/api/recently-played', require('./src/routes/recentlyPlayed.route'));
app.use('/api/stats', require('./src/routes/stats.route'));
app.use('/api/files', require('./src/routes/file.routes'));

// Error handling middleware
app.use((err, req, res) => {
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
