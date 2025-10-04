/**
 * Middleware for validating song IDs in routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateSongId = (req, res, next) => {
  const { songId } = req.params;

  // Basic validation - ensure songId is present and follows expected format
  if (!songId || typeof songId !== 'string' || songId.trim() === '') {
    return res.status(400).json({
      error: 'Invalid song ID',
      message: 'A valid song ID is required',
    });
  }

  // Additional validation can be added here, such as:
  // - Checking against a pattern (e.g., UUID)
  // - Verifying the song exists in the database

  next();
};

/**
 * Middleware for validating session IDs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateSessionId = (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    return res.status(400).json({
      error: 'Invalid session ID',
      message: 'A valid session ID is required',
    });
  }

  next();
};

/**
 * Middleware for validating audio format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateAudioFormat = (req, res, next) => {
  const { format } = req.query;

  if (format) {
    const supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm'];
    if (!supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        error: 'Unsupported format',
        message: `Supported formats are: ${supportedFormats.join(', ')}`,
        supportedFormats,
      });
    }
  }

  next();
};

module.exports = {
  validateSongId,
  validateSessionId,
  validateAudioFormat,
};
