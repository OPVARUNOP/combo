const http = require('http');
const mongoose = require('mongoose');
const logger = require('./config/logger');
const app = require('./app');
const { redisClient } = require('./services/redis');

const config = require('./config/config');

let server;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  
  // Initialize Redis connection
  redisClient.connect().then(() => {
    logger.info('Connected to Redis');
    
    // Start server after all connections are established
    server = http.createServer(app);
    
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  });
}).catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

module.exports = app;
