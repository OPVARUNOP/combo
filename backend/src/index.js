const http = require('http');
const logger = require('./config/logger');
const app = require('./app');
const config = require('./config/config');
const { initializeFirebase } = require('./services/firebase');

let server;

// Initialize Firebase and start server
const startServer = async () => {
  try {
    // Initialize Firebase
    await initializeFirebase();
    logger.info('Firebase services initialized');

    // Create HTTP server
    server = http.createServer(app);

    // Start listening
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

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
