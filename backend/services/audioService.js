const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('combo-624e1.appspot.com');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

// Supported audio formats and their MIME types
const SUPPORTED_FORMATS = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  webm: 'audio/webm',
};

class AudioService {
  constructor() {
    this.cacheDir = path.join(os.tmpdir(), 'combo-audio-cache');
    this.ensureCacheDirExists();
  }

  ensureCacheDirExists() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get audio stream with support for different formats and range requests
   * @param {string} songId - The ID of the song
   * @param {Object} options - Options for the stream
   * @param {number} options.start - Start byte position
   * @param {number} options.end - End byte position
   * @param {string} options.format - Desired output format (default: original format)
   * @returns {Promise<Object>} - Object containing the stream and metadata
   */
  async getAudioStream(songId, options = {}) {
    try {
      // Find the file with any supported extension
      const files = await bucket.getFiles({
        prefix: `songs/${songId}.`,
      });

      // Filter for supported formats
      const matchingFiles = files[0].filter((file) => {
        const ext = path.extname(file.name).toLowerCase().substring(1);
        return Object.keys(SUPPORTED_FORMATS).includes(ext);
      });

      if (matchingFiles.length === 0) {
        throw new Error('No supported audio file found');
      }

      // Get the first matching file
      const file = matchingFiles[0];
      const ext = path.extname(file.name).toLowerCase().substring(1);
      const mimeType = SUPPORTED_FORMATS[ext] || 'application/octet-stream';

      // Get file metadata
      const [metadata] = await file.getMetadata();
      const size = parseInt(metadata.size, 10);

      // Handle range requests
      let { start, end } = options;
      if (start !== undefined || end !== undefined) {
        start = start || 0;
        end = end || size - 1;

        if (start >= size || end >= size) {
          throw new Error('Requested range not satisfiable');
        }

        return {
          stream: file.createReadStream({ start, end }),
          headers: {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000', // 1 year
            'Content-Disposition': `inline; filename="${path.basename(file.name)}"`,
          },
          size,
          mimeType,
        };
      }

      // Full file stream
      return {
        stream: file.createReadStream(),
        headers: {
          'Content-Length': size,
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000', // 1 year
          'Content-Disposition': `inline; filename="${path.basename(file.name)}"`,
        },
        size,
        mimeType,
      };
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }

  /**
   * Cache audio file locally for offline playback
   * @param {string} songId - The ID of the song to cache
   * @returns {Promise<string>} - Path to the cached file
   */
  async cacheAudio(songId) {
    try {
      // Find the file with any supported extension
      const files = await bucket.getFiles({
        prefix: `songs/${songId}.`,
      });

      // Filter for supported formats (prefer mp3)
      const matchingFiles = files[0].filter((file) => {
        const ext = path.extname(file.name).toLowerCase().substring(1);
        return Object.keys(SUPPORTED_FORMATS).includes(ext);
      });

      if (matchingFiles.length === 0) {
        throw new Error('No supported audio file found for caching');
      }

      // Sort by preference (mp3 first, then others)
      matchingFiles.sort((a, b) => {
        const extA = path.extname(a.name).toLowerCase();
        const extB = path.extname(b.name).toLowerCase();
        return (extA === '.mp3' ? -1 : 1) - (extB === '.mp3' ? -1 : 1);
      });

      const file = matchingFiles[0];
      const ext = path.extname(file.name);
      const cachePath = path.join(this.cacheDir, `${songId}${ext}`);

      // If already cached, return the path
      if (fs.existsSync(cachePath)) {
        return cachePath;
      }

      // Ensure cache directory exists
      this.ensureCacheDirExists();

      // Download the file
      await file.download({ destination: cachePath });

      return cachePath;
    } catch (error) {
      console.error('Error caching audio:', error);
      throw error;
    }
  }

  /**
   * Get playback information for a song
   * @param {string} songId - The ID of the song
   * @returns {Promise<Object>} - Playback information
   */
  async getPlaybackInfo(songId) {
    try {
      // Find the file with any supported extension
      const files = await bucket.getFiles({
        prefix: `songs/${songId}.`,
      });

      // Filter for supported formats
      const matchingFiles = files[0].filter((file) => {
        const ext = path.extname(file.name).toLowerCase().substring(1);
        return Object.keys(SUPPORTED_FORMATS).includes(ext);
      });

      if (matchingFiles.length === 0) {
        throw new Error('No supported audio file found');
      }

      // Get the first matching file
      const file = matchingFiles[0];
      const ext = path.extname(file.name).toLowerCase().substring(1);
      const [metadata] = await file.getMetadata();

      return {
        id: songId,
        size: parseInt(metadata.size, 10),
        contentType: SUPPORTED_FORMATS[ext] || 'application/octet-stream',
        lastModified: new Date(metadata.updated),
        etag: metadata.etag,
        url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        format: ext,
        duration: await this.getAudioDuration(file),
      };
    } catch (error) {
      console.error('Error getting playback info:', error);
      throw error;
    }
  }

  /**
   * Get the duration of an audio file in seconds
   * @param {File} file - The file object
   * @returns {Promise<number>} - Duration in seconds
   */
  getAudioDuration(file) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(`gs://${bucket.name}/${file.name}`, (err, metadata) => {
        if (err) {
          console.error('Error getting audio duration:', err);
          resolve(null);
        } else {
          resolve(metadata.format.duration || null);
        }
      });
    });
  }

  /**
   * Generate a unique session ID for audio playback
   * @returns {string} - A unique session ID
   */
  generateSessionId() {
    return uuidv4();
  }

  /**
   * Clean up resources for a session
   * @param {string} sessionId - The session ID to clean up
   */
  async cleanupSession() {
    // Clean up any session-specific resources
    // This is a placeholder for future implementation
  }

  /**
   * Clean up all resources
   */
  async cleanup() {
    // Clean up all resources
    // This is a placeholder for future implementation
  }
}

module.exports = new AudioService();
