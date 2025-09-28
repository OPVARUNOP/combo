const dotenv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoose: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/streamify',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    accessExpirationMinutes: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: 10,
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  },
  apis: {
    youtube: {
      key: process.env.YOUTUBE_API_KEY,
      baseUrl: 'https://www.googleapis.com/youtube/v3',
    },
    soundcloud: {
      clientId: process.env.SOUNDCLOUD_CLIENT_ID,
      baseUrl: 'https://api.soundcloud.com',
    },
    audius: {
      baseUrl: process.env.AUDIUS_API_URL || 'https://audius-metadata-1.figment.io/v1',
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
};

module.exports = config;
