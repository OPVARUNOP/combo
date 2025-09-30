const axios = require('axios');
const cacheService = require('./cache.service');

const JAMENDO_CLIENT_ID = 'c1eea382';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

/**
 * Jamendo API Service
 * Handles all interactions with the Jamendo API
 */
class JamendoService {
  constructor() {
    this.client = axios.create({
      baseURL: JAMENDO_BASE_URL,
      timeout: 15000,
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
      },
    });
  }

  /**
   * Search for tracks
   * @param {string} query - Search query
   * @param {Object} options - Search options (limit, offset, etc.)
   * @returns {Promise<Object>} - Search results
   */
  async searchTracks(query, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      const cacheKey = `jamendo:search:${query}:${limit}:${offset}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log('Cache hit for Jamendo search');
        return cached;
      }

      console.log(`Jamendo API search: ${query}`);

      const response = await this.client.get('/tracks/', {
        params: {
          search: query,
          limit,
          offset,
          orderby: 'popularity_total',
        },
      });

      const tracks = response.data.results.map(track => ({
        id: track.id.toString(),
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: track.duration,
        releaseDate: track.releasedate,
        jamendoId: track.id,
        audioUrl: track.audio,
        imageUrl: track.image,
        license: track.license_ccurl,
        tags: track.tags?.split(',').map(tag => tag.trim()) || [],
      }));

      const result = {
        tracks,
        total: response.data.headers.results_count,
        query,
        source: 'jamendo',
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      console.error('Jamendo search error:', error.message);
      throw new Error(`Failed to search Jamendo: ${error.message}`);
    }
  }

  /**
   * Get trending tracks
   * @param {Object} options - Trending options
   * @returns {Promise<Object>} - Trending tracks
   */
  async getTrendingTracks(options = {}) {
    try {
      const { limit = 20 } = options;

      const cacheKey = `jamendo:trending:${limit}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log('Cache hit for Jamendo trending');
        return cached;
      }

      console.log('Jamendo API trending request');

      const response = await this.client.get('/tracks/', {
        params: {
          orderby: 'popularity_total',
          limit,
        },
      });

      const tracks = response.data.results.map(track => ({
        id: track.id.toString(),
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: track.duration,
        releaseDate: track.releasedate,
        jamendoId: track.id,
        audioUrl: track.audio,
        imageUrl: track.image,
        license: track.license_ccurl,
        popularity: track.popularity_total,
      }));

      const result = {
        tracks,
        total: tracks.length,
        source: 'jamendo',
      };

      // Cache for 30 minutes
      await cacheService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      console.error('Jamendo trending error:', error.message);
      throw new Error(`Failed to get Jamendo trending: ${error.message}`);
    }
  }

  /**
   * Get track by ID
   * @param {string} trackId - Track ID
   * @returns {Promise<Object>} - Track details
   */
  async getTrackById(trackId) {
    try {
      const cacheKey = `jamendo:track:${trackId}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log('Cache hit for Jamendo track');
        return cached;
      }

      console.log(`Jamendo API get track: ${trackId}`);

      const response = await this.client.get('/tracks/', {
        params: {
          id: trackId,
        },
      });

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('Track not found');
      }

      const track = response.data.results[0];

      const result = {
        id: track.id.toString(),
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: track.duration,
        releaseDate: track.releasedate,
        jamendoId: track.id,
        audioUrl: track.audio,
        imageUrl: track.image,
        license: track.license_ccurl,
        description: track.shorturl,
        tags: track.tags?.split(',').map(tag => tag.trim()) || [],
      };

      // Cache for 24 hours
      await cacheService.set(cacheKey, result, 86400);

      return result;
    } catch (error) {
      console.error('Jamendo get track error:', error.message);
      throw new Error(`Failed to get Jamendo track: ${error.message}`);
    }
  }

  /**
   * Get albums
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Albums
   */
  async getAlbums(options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      const cacheKey = `jamendo:albums:${limit}:${offset}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log('Cache hit for Jamendo albums');
        return cached;
      }

      console.log('Jamendo API get albums');

      const response = await this.client.get('/albums/', {
        params: {
          limit,
          offset,
          orderby: 'popularity_total',
        },
      });

      const albums = response.data.results.map(album => ({
        id: album.id.toString(),
        title: album.name,
        artist: album.artist_name,
        releaseDate: album.releasedate,
        imageUrl: album.image,
        trackCount: album.tracks?.length || 0,
      }));

      const result = {
        albums,
        total: response.data.headers.results_count,
        source: 'jamendo',
      };

      // Cache for 2 hours
      await cacheService.set(cacheKey, result, 7200);

      return result;
    } catch (error) {
      console.error('Jamendo get albums error:', error.message);
      throw new Error(`Failed to get Jamendo albums: ${error.message}`);
    }
  }

  /**
   * Get artists
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Artists
   */
  async getArtists(options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      const cacheKey = `jamendo:artists:${limit}:${offset}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log('Cache hit for Jamendo artists');
        return cached;
      }

      console.log('Jamendo API get artists');

      const response = await this.client.get('/artists/', {
        params: {
          limit,
          offset,
          orderby: 'popularity_total',
        },
      });

      const artists = response.data.results.map(artist => ({
        id: artist.id.toString(),
        name: artist.name,
        imageUrl: artist.image,
        website: artist.website,
        biography: artist.bio,
      }));

      const result = {
        artists,
        total: response.data.headers.results_count,
        source: 'jamendo',
      };

      // Cache for 4 hours
      await cacheService.set(cacheKey, result, 14400);

      return result;
    } catch (error) {
      console.error('Jamendo get artists error:', error.message);
      throw new Error(`Failed to get Jamendo artists: ${error.message}`);
    }
  }
}

// Create singleton instance
const jamendoService = new JamendoService();

module.exports = jamendoService;
