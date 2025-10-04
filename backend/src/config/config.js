const dotenv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

const config = {
  // Environment and Server
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'combo_jwt_secret_key_2024',
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 1440, // 24 hours
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
  },

  // Rate limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_UPLOAD || '10000000'), // 10MB
    fileUploadPath: process.env.FILE_UPLOAD_PATH || './public/uploads',
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
    ],
  },

  // API Configuration
  api: {
    prefix: '/api',
  },

  // External APIs
  apis: {
    youtube: {
      key: process.env.YOUTUBE_API_KEY,
      baseUrl: 'https://www.googleapis.com/youtube/v3',
    },
    soundcloud: {
      clientId: process.env.SOUNDCLOUD_CLIENT_ID,
      baseUrl: 'https://api.soundcloud.com',
    },
    jamendo: {
      clientId: process.env.JAMENDO_CLIENT_ID,
      baseUrl: 'https://api.jamendo.com/v3.0',
    },
  },

  // Backblaze B2 Configuration
  backblaze: {
    keyId: process.env.B2_APPLICATION_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    bucketId: process.env.B2_BUCKET_ID,
    bucketName: process.env.B2_BUCKET_NAME,
    endpoint: process.env.B2_ENDPOINT,
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
  },
};

module.exports = config;
