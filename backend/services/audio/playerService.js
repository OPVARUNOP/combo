const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('combo-624e1.appspot.com');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

class AudioPlayerService {
  constructor() {
    this.cacheDir = path.join(os.tmpdir(), 'combo-audio-cache');
    this.activeStreams = new Map();
    this.ensureCacheDirExists();
  }

  ensureCacheDirExists() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async getAudioStream(songId, options = {}) {
    try {
      const { start, end } = options;
      const file = bucket.file(`songs/${songId}`);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error('Audio file not found');
      }

      let stream;

      if (start !== undefined || end !== undefined) {
        // Stream a specific range of the audio file
        const range = {};
        if (start !== undefined) range.start = start;
        if (end !== undefined) range.end = end;
        stream = file.createReadStream(range);
      } else {
        // Stream the entire file
        stream = file.createReadStream();
      }

      return stream;
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }

  transcodeAudio(inputPath, outputPath, format = 'mp3', bitrate = '192k') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioBitrate(bitrate)
        .format(format)
        .on('error', (err) => {
          console.error('Error transcoding audio:', err);
          reject(err);
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .save(outputPath);
    });
  }

  async getPlaybackInfo(songId) {
    try {
      const file = bucket.file(`songs/${songId}`);
      const [metadata] = await file.getMetadata();

      return {
        id: songId,
        contentType: metadata.contentType,
        size: metadata.size,
        duration: metadata.metadata?.duration || 0,
        bitrate: metadata.metadata?.bitrate || 0,
        lastModified: metadata.updated,
      };
    } catch (error) {
      console.error('Error getting playback info:', error);
      throw error;
    }
  }

  generateSessionId() {
    return uuidv4();
  }

  cleanupSession(sessionId) {
    if (this.activeStreams.has(sessionId)) {
      const stream = this.activeStreams.get(sessionId);
      if (stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
      this.activeStreams.delete(sessionId);
    }
  }

  async cleanup() {
    // Clean up all active streams
    for (const [sessionId] of this.activeStreams) {
      await this.cleanupSession(sessionId);
    }

    // Clean up cache directory
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
    }
  }
}

module.exports = new AudioPlayerService();
