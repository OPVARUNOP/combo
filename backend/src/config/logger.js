const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const config = require('./config');

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message} `;

  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata, null, 2);
  }

  return msg;
});

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.env === 'development' ? colorize() : format.simple(),
    config.env === 'development' ? logFormat : combine(timestamp(), json())
  ),
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to `combined.log`
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, log to the console as well
if (config.env === 'development') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

// Create a stream for Morgan to use with Winston
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
