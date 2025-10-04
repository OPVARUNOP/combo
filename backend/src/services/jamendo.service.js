const axios = require('axios');
const axiosRetry = require('axios-retry');
const cacheService = require('./cache.service');
const logger = require('../config/logger');

// Configuration
const JAMENDO_CONFIG = {
  BASE_URL: process.env.JAMENDO_BASE_URL || 'https://api.jamendo.com/v3.0',
  CLIENT_ID: process.env.JAMENDO_CLIENT_ID || 'c1eea382',
  TIMEOUT: parseInt(process.env.JAMENDO_TIMEOUT_MS) || 15000,
  MAX_RETRIES: parseInt(process.env.JAMENDO_MAX_RETRIES) || 3,
  CACHE_TTL: {
    SEARCH: parseInt(process.env.CACHE_TTL_SEARCH) || 3600,
    TRACK: parseInt(process.env.CACHE_TTL_TRACK) || 86400,
    TRENDING: parseInt(process.env.CACHE_TTL_TRENDING) || 1800,
    ALBUM: parseInt(process.env.CACHE_TTL_ALBUM) || 7200,
    ARTIST: parseInt(process.env.CACHE_TTL_ARTIST) || 14400,
    GENRES: parseInt(process.env.CACHE_TTL_GENRES) || 86400 * 7, // 1 week
  },
};

// Custom error class for Jamendo API errors
class JamendoError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'JamendoError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Jamendo API Service
 * Handles all interactions with the Jamendo API
 */
class JamendoService {
  constructor() {
    this.client = axios.create({
      baseURL: JAMENDO_CONFIG.BASE_URL,
      timeout: JAMENDO_CONFIG.TIMEOUT,
      params: {
        client_id: JAMENDO_CONFIG.CLIENT_ID,
        format: 'json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: JAMENDO_CONFIG.MAX_RETRIES,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response && error.response.status >= 500)
        );
      },
    });

    // Log request/response
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Jamendo API Request: ${config.method.toUpperCase()} ${config.url}`, {
          params: config.params,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        logger.error('Jamendo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Jamendo API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const errorMessage = error.response
          ? `Status: ${error.response.status} - ${error.response.statusText}`
          : error.message;

        logger.error('Jamendo API Error:', {
          message: errorMessage,
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
        });

        if (error.response) {
          // Handle specific error statuses
          switch (error.response.status) {
            case 400:
              return Promise.reject(new JamendoError('Invalid request', 400, 'INVALID_REQUEST'));
            case 401:
              return Promise.reject(
                new JamendoError('Unauthorized - check your API key', 401, 'UNAUTHORIZED')
              );
            case 404:
              return Promise.reject(new JamendoError('Resource not found', 404, 'NOT_FOUND'));
            case 429:
              return Promise.reject(
                new JamendoError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED')
              );
            case 500:
              return Promise.reject(new JamendoError('Internal server error', 500, 'SERVER_ERROR'));
            default:
              return Promise.reject(
                new JamendoError('API request failed', error.response.status, 'API_ERROR')
              );
          }
        }
        return Promise.reject(new JamendoError('Network error', 503, 'NETWORK_ERROR'));
      }
    );
  }

  /**
   * Search for tracks with advanced filtering and sorting
   * @param {string} query - Search query
   * @param {Object} [options] - Search options
   * @param {number} [options.limit=20] - Number of results to return
   * @param {number} [options.offset=0] - Pagination offset
   * @param {string} [options.order='popularity_total'] - Sort order (popularity_total, releasedate, duration, etc.)
   * @param {string} [options.genre] - Filter by genre
   * @param {boolean} [options.hasLyrics] - Only include tracks with lyrics
   * @param {number} [options.minBpm] - Minimum BPM
   * @param {number} [options.maxBpm] - Maximum BPM
   * @param {string} [options.license] - Filter by license (e.g., 'cc-by')
   * @param {string} [options.artistId] - Filter by artist ID
   * @param {string} [options.albumId] - Filter by album ID
   * @param {string} [options.excludeId] - Exclude specific track ID from results
   * @returns {Promise<Object>} Search results with tracks and metadata
   */
  async searchTracks(query, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        order = 'popularity_total',
        genre,
        hasLyrics,
        minBpm,
        maxBpm,
        license,
        artistId,
        albumId,
        excludeId,
      } = options;

      // Generate cache key based on all parameters
      const cacheKey = `jamendo:search:${JSON.stringify({ query, ...options })}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for search', { query, options });
        return cached;
      }

      logger.info('Searching Jamendo tracks', { query, options });

      // Build query parameters
      const params = {
        search: query || '',
        limit,
        offset,
        order: `${order}_desc`,
        include: 'musicinfo,tags,lyrics,stats',
        groupby: 'track_id',
      };

      // Add filters
      if (genre) params.tags = genre;
      if (hasLyrics !== undefined) params.haslyrics = hasLyrics ? 'true' : 'false';
      if (minBpm) params.bpm_min = minBpm;
      if (maxBpm) params.bpm_max = maxBpm;
      if (license) params.license_cc0 = license === 'cc0' ? 'true' : 'false';
      if (artistId) params.artist_id = artistId;
      if (albumId) params.album_id = albumId;
      if (excludeId) params.id = `!${excludeId}`;

      const response = await this.client.get('/tracks/', { params });

      if (!response.data?.results) {
        throw new JamendoError('Invalid response format', 500, 'INVALID_RESPONSE');
      }

      // Process and normalize track data
      const tracks = response.data.results.map((track) => this.normalizeTrack(track));
      const pagination = this.extractPagination(response.data.headers);

      const result = {
        query,
        tracks,
        total: pagination.total,
        limit: pagination.limit,
        offset: pagination.offset,
        ...(genre && { genre }),
        ...(artistId && { artistId }),
        ...(albumId && { albumId }),
        source: 'jamendo',
        timestamp: new Date().toISOString(),
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.SEARCH);

      return result;
    } catch (error) {
      logger.error('Error searching tracks', {
        query,
        options,
        error: error.message,
        stack: error.stack,
      });

      throw new JamendoError(
        error.message || 'Failed to search tracks',
        error.statusCode || 500,
        error.code || 'SEARCH_ERROR'
      );
    }
  }

  /**
   * Normalize track data from Jamendo API response
   * @private
   */
  normalizeTrack(track) {
    if (!track) return null;

    return {
      id: track.id.toString(),
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id,
      album: track.album_name,
      albumId: track.album_id,
      duration: track.duration,
      releaseDate: track.releasedate,
      audioUrl: track.audio,
      audioDownloadUrl: track.audiodownload,
      imageUrl: track.image,
      largeImageUrl: track.image?.replace(/\/\d+\//, '/crop/1000x1000/'),
      smallImageUrl: track.image?.replace(/\/\d+\//, '/crop/150x150/'),
      license: track.license_ccurl,
      licenseType: track.license_cc0 ? 'cc0' : 'standard',
      bpm: track.bpm,
      tags: track.tags
        ? track.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      genres: track.musicinfo?.tags?.genre || [],
      instruments: track.musicinfo?.tags?.instruments || [],
      moods: track.musicinfo?.tags?.mood || [],
      vocals: track.musicinfo?.vocalinstrumental === 'vocal',
      hasLyrics: track.lyrics !== '0',
      popularity: track.popularity_total || 0,
      playCount: track.audiodownload_allowed ? track.audiodownload_allowed : 0,
      downloadCount: track.audiodownload_allowed ? track.audiodownload_allowed : 0,
      // Add additional Jamendo-specific fields
      jamendoId: track.id,
      jamendoArtistId: track.artist_id,
      jamendoAlbumId: track.album_id,
      audioInfo: {
        bitrate: track.audiodownload_allowed ? 320 : 128, // Default to 128kbps for streaming, 320kbps for download
        sampleRate: 44100, // Standard CD quality
        channels: 2, // Stereo
      },
      provider: 'jamendo',
      urls: {
        jamendo: `https://www.jamendo.com/track/${track.id}`,
        artist: `https://www.jamendo.com/artist/${track.artist_id}`,
        album: track.album_id ? `https://www.jamendo.com/album/${track.album_id}` : null,
      },
      timestamps: {
        added: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Extract pagination info from response headers
   * @private
   */
  extractPagination(headers) {
    if (!headers) return { total: 0, offset: 0, limit: 0 };

    return {
      total: parseInt(headers.results_count) || 0,
      offset: parseInt(headers.params?.offset) || 0,
      limit: parseInt(headers.params?.limit) || 20,
    };
  }

  /**
   * Get detailed track information by ID
   * @param {string} trackId - The Jamendo track ID
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.includeLyrics=false] - Whether to include lyrics if available
   * @param {boolean} [options.includeSimilar=false] - Whether to include similar tracks
   * @returns {Promise<Object>} Detailed track information
   */
  async getTrackById(trackId, options = {}) {
    try {
      if (!trackId) {
        throw new JamendoError('Track ID is required', 400, 'MISSING_TRACK_ID');
      }

      const { includeLyrics = false, includeSimilar = false } = options;
      const cacheKey = `jamendo:track:${trackId}:${includeLyrics ? 'with_lyrics' : 'no_lyrics'}:${includeSimilar ? 'with_similar' : 'no_similar'}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for track', { trackId });
        return cached;
      }

      logger.info('Fetching track from Jamendo', { trackId, options });

      // Build query parameters
      const params = {
        id: trackId,
        include: 'musicinfo,tags,lyrics,stats',
      };

      if (includeLyrics) {
        params.include += ',lyrics';
      }

      const response = await this.client.get('/tracks/', { params });

      if (!response.data?.results?.length) {
        throw new JamendoError('Track not found', 404, 'TRACK_NOT_FOUND');
      }

      // Get the first (and should be only) track
      const trackData = response.data.results[0];

      // Normalize track data
      const track = this.normalizeTrack(trackData);

      // Add additional details
      const result = {
        ...track,
        stats: {
          playCount: trackData.stats?.rate_downloads_total || 0,
          downloadCount: trackData.stats?.rate_downloads_total || 0,
          listCount: trackData.stats?.rate_listened_total || 0,
          rate: trackData.stats?.rate || 0,
        },
        provider: 'jamendo',
        _raw: options.includeRaw ? trackData : undefined,
      };

      // Include lyrics if requested and available
      if (includeLyrics && trackData.lyrics) {
        result.lyrics = {
          text: trackData.lyrics.lyrics_text,
          language: trackData.lyrics.language,
          copyright: trackData.lyrics.copyright,
        };
      }

      // Include similar tracks if requested
      if (includeSimilar) {
        try {
          const similarTracks = await this.getSimilarTracks(trackId, { limit: 5 });
          result.similarTracks = similarTracks;
        } catch (similarError) {
          logger.warn('Failed to fetch similar tracks', {
            trackId,
            error: similarError.message,
          });
          result.similarTracks = [];
        }
      }

      // Cache for 24 hours
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.TRACK);

      return result;
    } catch (error) {
      logger.error('Error fetching track', {
        trackId,
        error: error.message,
        code: error.code,
        stack: error.stack,
      });

      throw new JamendoError(
        error.message || 'Failed to fetch track',
        error.statusCode || 500,
        error.code || 'TRACK_FETCH_ERROR'
      );
    }
  }

  /**
   * Get similar tracks based on a track ID
   * @param {string} trackId - The Jamendo track ID
   * @param {Object} [options] - Options
   * @param {number} [options.limit=5] - Number of similar tracks to return
   * @returns {Promise<Array>} Array of similar tracks
   */
  async getSimilarTracks(trackId, options = {}) {
    const { limit = 5 } = options;
    const cacheKey = `jamendo:similar:${trackId}:${limit}`;

    try {
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for similar tracks', { trackId });
        return cached;
      }

      logger.info('Fetching similar tracks from Jamendo', { trackId, limit });

      // First get the track's tags to find similar tracks
      const track = await this.getTrackById(trackId);

      if (!track.tags?.length) {
        return [];
      }

      // Use the first few tags to find similar tracks
      const mainTags = track.tags.slice(0, 3).join(',');

      // Search for tracks with similar tags
      const similarTracks = await this.searchTracks(mainTags, {
        limit,
        excludeId: trackId, // Exclude the current track
      });

      // Cache for 1 hour
      await cacheService.set(cacheKey, similarTracks.tracks, 3600);

      return similarTracks.tracks;
    } catch (error) {
      logger.error('Error fetching similar tracks', {
        trackId,
        error: error.message,
        stack: error.stack,
      });

      // Don't fail the whole request if similar tracks can't be fetched
      return [];
    }
  }

  /**
   * Get albums with advanced filtering and pagination
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=20] - Number of albums per page
   * @param {number} [options.offset=0] - Pagination offset
   * @param {string} [options.order='popularity_total'] - Sort order (popularity_total, releasedate, etc.)
   * @param {string} [options.artistId] - Filter by artist ID
   * @param {string} [options.genre] - Filter by genre
   * @param {string} [options.query] - Search query for album names
   * @returns {Promise<Object>} Paginated albums with metadata
   */
  async getAlbums(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        order = 'popularity_total',
        artistId,
        genre,
        query,
      } = options;

      // Generate cache key based on all parameters
      const cacheKey = `jamendo:albums:${JSON.stringify({ limit, offset, order, artistId, genre, query })}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for albums', { options });
        return cached;
      }

      logger.info('Fetching albums from Jamendo', { options });

      // Build query parameters
      const params = {
        limit,
        offset,
        order: `${order}_desc`,
        include: 'tracks,artist',
      };

      // Add filters
      if (artistId) params.artist_id = artistId;
      if (genre) params.tags = genre;
      if (query) params.name = query;

      const response = await this.client.get('/albums/', { params });

      if (!response.data?.results) {
        throw new JamendoError('Invalid response format', 500, 'INVALID_RESPONSE');
      }

      // Process and normalize album data
      const albums = response.data.results.map((album) => ({
        id: album.id.toString(),
        title: album.name,
        artist: album.artist_name,
        artistId: album.artist_id,
        releaseDate: album.releasedate,
        releaseYear: album.releasedate ? new Date(album.releasedate).getFullYear() : null,
        imageUrl: album.image,
        largeImageUrl: album.image?.replace(/\/\d+\//, '/crop/1000x1000/'),
        smallImageUrl: album.image?.replace(/\/\d+\//, '/crop/150x150/'),
        trackCount: album.tracks?.length || 0,
        duration: album.duration,
        genre: album.tags
          ? album.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)[0]
          : null,
        tags: album.tags
          ? album.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        provider: 'jamendo',
        urls: {
          jamendo: `https://www.jamendo.com/album/${album.id}`,
          artist: `https://www.jamendo.com/artist/${album.artist_id}`,
        },
        // Include track IDs for further processing
        trackIds: album.tracks?.map((track) => track.id.toString()) || [],
      }));

      const result = {
        albums,
        total: response.data.headers?.results_count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        ...(artistId && { artistId }),
        ...(genre && { genre }),
        ...(query && { query }),
        source: 'jamendo',
        timestamp: new Date().toISOString(),
      };

      // Cache for 2 hours
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.ALBUM);

      return result;
    } catch (error) {
      logger.error('Error fetching albums', {
        error: error.message,
        options,
        stack: error.stack,
      });

      throw new JamendoError(
        error.message || 'Failed to fetch albums',
        error.statusCode || 500,
        error.code || 'ALBUMS_FETCH_ERROR'
      );
    }
  }

  /**
   * Get album by ID with tracks and artist information
   * @param {string} albumId - The Jamendo album ID
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.includeTracks=true] - Whether to include album tracks
   * @param {boolean} [options.includeArtist=true] - Whether to include artist information
   * @returns {Promise<Object>} Album details with tracks and artist
   */
  async getAlbumById(albumId, options = {}) {
    try {
      if (!albumId) {
        throw new JamendoError('Album ID is required', 400, 'MISSING_ALBUM_ID');
      }

      const { includeTracks = true, includeArtist = true } = options;

      const cacheKey = `jamendo:album:${albumId}:${includeTracks ? 'with_tracks' : 'no_tracks'}:${includeArtist ? 'with_artist' : 'no_artist'}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for album', { albumId });
        return cached;
      }

      logger.info('Fetching album from Jamendo', { albumId, options });

      // Get album details
      const response = await this.client.get(`/albums/${albumId}`, {
        params: {
          include: 'tracks,artist',
        },
      });

      if (!response.data?.results?.[0]) {
        throw new JamendoError('Album not found', 404, 'ALBUM_NOT_FOUND');
      }

      const albumData = response.data.results[0];

      // Fetch additional data in parallel if needed
      const [tracks, artist] = await Promise.all([
        includeTracks && albumData.tracks?.length
          ? Promise.all(albumData.tracks.map((track) => this.getTrackById(track.id)))
          : Promise.resolve([]),
        includeArtist && albumData.artist_id
          ? this.getArtistById(albumData.artist_id, { includeAlbums: false })
          : Promise.resolve(null),
      ]);

      // Build the complete album object
      const album = {
        id: albumData.id.toString(),
        title: albumData.name,
        artist: albumData.artist_name,
        artistId: albumData.artist_id,
        releaseDate: albumData.releasedate,
        releaseYear: albumData.releasedate ? new Date(albumData.releasedate).getFullYear() : null,
        imageUrl: albumData.image,
        largeImageUrl: albumData.image?.replace(/\/\d+\//, '/crop/1000x1000/'),
        smallImageUrl: albumData.image?.replace(/\/\d+\//, '/crop/150x150/'),
        duration: albumData.duration,
        trackCount: albumData.tracks?.length || 0,
        genre: albumData.tags
          ? albumData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)[0]
          : null,
        tags: albumData.tags
          ? albumData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        provider: 'jamendo',
        urls: {
          jamendo: `https://www.jamendo.com/album/${albumData.id}`,
          artist: `https://www.jamendo.com/artist/${albumData.artist_id}`,
        },
        // Include related data if requested
        ...(includeTracks && { tracks }),
        ...(includeArtist && artist && { artist }),
        // Add timestamps
        timestamps: {
          added: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      };

      // Cache for 24 hours
      await cacheService.set(cacheKey, album, JAMENDO_CONFIG.CACHE_TTL.ALBUM);

      return album;
    } catch (error) {
      logger.error('Error fetching album', {
        albumId,
        error: error.message,
        code: error.code,
        stack: error.stack,
      });

      throw new JamendoError(
        error.message || 'Failed to fetch album',
        error.statusCode || 500,
        error.code || 'ALBUM_FETCH_ERROR'
      );
    }
  }

  /**
   * Get artists with advanced filtering and pagination
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=20] - Number of artists per page
   * @param {number} [options.offset=0] - Pagination offset
   * @param {string} [options.order='popularity_total'] - Sort order (popularity_total, name, joindate, etc.)
   * @param {string} [options.genre] - Filter by genre
   * @param {string} [options.country] - Filter by country code (e.g., 'us', 'fr')
   * @param {string} [options.query] - Search query for artist names
   * @param {boolean} [options.hasimage] - Only include artists with images
   * @param {string} [options.audioformat] - Filter by audio format (e.g., 'mp32', 'ogg')
   * @returns {Promise<Object>} Paginated artists with metadata
   */
  async getArtists(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        order = 'popularity_total',
        genre,
        country,
        query,
        hasimage,
        audioformat,
      } = options;

      // Generate cache key based on all parameters
      const cacheKey = `jamendo:artists:${JSON.stringify({ limit, offset, order, genre, country, query, hasimage, audioformat })}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for artists', { options });
        return cached;
      }

      logger.info('Fetching artists from Jamendo', { options });

      // Build query parameters
      const params = {
        limit,
        offset,
        order: `${order}_desc`,
        imagesize: '300,500,1000',
        include: 'musicinfo,stats',
        groupby: 'artist_id',
      };

      // Add optional filters
      if (genre) params.tags = genre;
      if (country) params.country = country;
      if (query) params.name = query;
      if (hasimage) params.hasimage = 1;
      if (audioformat) params.audioformat = audioformat;

      // Make the API request
      const response = await this.client.get('/artists', { params });

      if (!response.data || !response.data.results) {
        throw new JamendoError('Invalid response from Jamendo API', 500, 'INVALID_RESPONSE');
      }

      // Extract pagination info from headers
      const pagination = this.extractPagination(response.headers);

      // Format the response
      const result = {
        data: response.data.results.map((artist) => this.normalizeArtist(artist)),
        pagination: {
          total: pagination.total || response.data.results.length,
          offset: parseInt(offset, 10),
          limit: parseInt(limit, 10),
          ...pagination,
        },
        filters: {
          genre,
          country,
          query,
          hasimage,
          audioformat,
        },
      };

      // Cache the result
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.ARTIST);

      return result;
    } catch (error) {
      logger.error('Error fetching artists:', error);
      throw new JamendoError(
        error.message || 'Failed to fetch artists',
        error.statusCode || 500,
        error.code || 'ARTISTS_FETCH_ERROR'
      );
    }
  }

  /**
   * Get artist by ID with detailed information
   * @param {string} artistId - The Jamendo artist ID
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.includeTracks=true] - Whether to include artist's top tracks
   * @param {boolean} [options.includeAlbums=true] - Whether to include artist's albums
   * @param {number} [options.tracksLimit=10] - Number of top tracks to include
   * @param {number} [options.albumsLimit=5] - Number of albums to include
   * @returns {Promise<Object>} Artist details with optional tracks and albums
   */
  async getArtistById(artistId, options = {}) {
    try {
      if (!artistId) {
        throw new JamendoError('Artist ID is required', 400, 'MISSING_ARTIST_ID');
      }

      const {
        includeTracks = true,
        includeAlbums = true,
        tracksLimit = 10,
        albumsLimit = 5,
      } = options;

      // Generate cache key based on artist ID and options
      const cacheKey = `jamendo:artist:${artistId}:${JSON.stringify(options)}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for artist', { artistId });
        return cached;
      }

      logger.info('Fetching artist details from Jamendo', { artistId });

      // Fetch artist details
      const [artistResponse, tracksResponse, albumsResponse] = await Promise.all([
        // Get artist info
        this.client.get(`/artists`, {
          params: {
            id: artistId,
            include: 'musicinfo,stats,licenses',
            imagesize: '300,500,1000,2000',
          },
        }),
        // Get artist's top tracks if requested
        includeTracks
          ? this.client
              .get('/tracks', {
                params: {
                  artist_id: artistId,
                  limit: tracksLimit,
                  order: 'popularity_total_desc',
                  include: 'musicinfo,lyrics',
                  groupby: 'track_id',
                },
              })
              .catch(() => null)
          : Promise.resolve(null),
        // Get artist's albums if requested
        includeAlbums
          ? this.client
              .get('/albums', {
                params: {
                  artist_id: artistId,
                  limit: albumsLimit,
                  order: 'releasedate_desc',
                  imagesize: '300,500,1000',
                  include: 'tracks,licenses',
                },
              })
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      // Check if artist was found
      if (
        !artistResponse.data ||
        !artistResponse.data.results ||
        artistResponse.data.results.length === 0
      ) {
        throw new JamendoError('Artist not found', 404, 'ARTIST_NOT_FOUND');
      }

      const artist = artistResponse.data.results[0];

      // Format the response
      const result = {
        ...this.normalizeArtist(artist),
        tracks: null,
        albums: null,
      };

      // Process tracks if available
      if (includeTracks && tracksResponse?.data?.results) {
        result.tracks = {
          data: tracksResponse.data.results.map((track) => this.normalizeTrack(track)),
          pagination: this.extractPagination(tracksResponse.headers),
        };
      }

      // Process albums if available
      if (includeAlbums && albumsResponse?.data?.results) {
        result.albums = {
          data: albumsResponse.data.results.map((album) => ({
            id: album.id,
            name: album.name,
            releasedate: album.releasedate,
            image: album.image,
            tracks: album.tracks?.map((track) => this.normalizeTrack(track)) || [],
          })),
          pagination: this.extractPagination(albumsResponse.headers),
        };
      }

      // Cache the result
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.ARTIST);

      return result;
    } catch (error) {
      logger.error('Error fetching artist:', { artistId, error });
      throw new JamendoError(
        error.message || 'Failed to fetch artist',
        error.statusCode || 500,
        error.code || 'ARTIST_FETCH_ERROR'
      );
    }
  }

  /**
   * Normalize artist data from Jamendo API response
   * @private
   */
  normalizeArtist(artist) {
    if (!artist) return null;

    return {
      id: artist.id,
      name: artist.name,
      website: artist.website,
      joindate: artist.joindate,
      shareUrl: artist.shareurl,
      image: {
        small: artist.image || artist.image_small || artist.image_medium || artist.image_big || '',
        medium: artist.image_medium || artist.image_big || artist.image || artist.image_small || '',
        large: artist.image_big || artist.image_medium || artist.image || artist.image_small || '',
        extraLarge:
          artist.image_xl || artist.image_big || artist.image_medium || artist.image || '',
      },
      stats: {
        fans: artist.fans || 0,
        followers: artist.followers || 0,
        playlists: artist.playlists || 0,
        playcount: artist.playcount || 0,
        tracks: artist.tracks || 0,
        albums: artist.albums || 0,
      },
      location: {
        city: artist.city,
        country: artist.country,
        countryCode: artist.country_code,
        region: artist.region,
      },
      urls: {
        jamendo: artist.shareurl,
        website: artist.website,
        twitter: artist.twitter,
        facebook: artist.facebook,
        instagram: artist.instagram,
        soundcloud: artist.soundcloud,
        bandcamp: artist.bandcamp,
        spotify: artist.spotify,
      },
      tags: artist.tags ? artist.tags.split(' ').filter(Boolean) : [],
      genres: artist.musicinfo?.tags?.genres || [],
      instruments: artist.musicinfo?.tags?.instruments || [],
      description: artist.musicinfo?.shorturl || '',
    };
  }

  /**
   * Get trending tracks with advanced options
   * @param {Object} [options] - Trending options
   * @param {number} [options.limit=20] - Number of tracks to return
   * @param {string} [options.timeRange='week'] - Time range for trending (day, week, month, year)
   * @param {string} [options.genre] - Filter by genre
   * @param {string} [options.order='popularity_total'] - Sort order (popularity_total, listened, downloaded)
   * @returns {Promise<Object>} Trending tracks with metadata
   */
  async getTrendingTracks(options = {}) {
    try {
      const { limit = 20, timeRange = 'week', genre, order = 'popularity_total' } = options;

      // Generate cache key based on all parameters
      const cacheKey = `jamendo:trending:${JSON.stringify({ timeRange, limit, genre, order })}`;

      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for trending tracks', { options });
        return cached;
      }

      logger.info('Fetching trending tracks from Jamendo', { options });

      // Build query parameters
      const params = {
        limit,
        order: `${order}_desc`,
        include: 'musicinfo,tags',
        groupby: 'artist_id',
      };

      // Add time range filter
      const now = new Date();
      let dateFilter = new Date();

      switch (timeRange) {
        case 'day':
          dateFilter.setDate(now.getDate() - 1);
          break;
        case 'month':
          dateFilter.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          dateFilter.setFullYear(now.getFullYear() - 1);
          break;
        case 'week':
        default:
          dateFilter.setDate(now.getDate() - 7);
      }

      params.datebetween = [
        dateFilter.toISOString().split('T')[0],
        now.toISOString().split('T')[0],
      ].join('_');

      // Add genre filter if specified
      if (genre) {
        params.tags = genre;
      }

      const response = await this.client.get('/tracks/', { params });

      if (!response.data?.results) {
        throw new JamendoError('Invalid response format', 500, 'INVALID_RESPONSE');
      }

      // Process and normalize track data
      const tracks = response.data.results.map((track) => this.normalizeTrack(track));
      const pagination = this.extractPagination(response.data.headers);

      const result = {
        tracks,
        total: pagination.total,
        limit: pagination.limit,
        timeRange,
        ...(genre && { genre }),
        source: 'jamendo',
        timestamp: new Date().toISOString(),
      };

      // Cache for 30 minutes
      await cacheService.set(cacheKey, result, JAMENDO_CONFIG.CACHE_TTL.TRENDING);

      return result;
    } catch (error) {
      logger.error('Error fetching trending tracks', {
        error: error.message,
        options,
        stack: error.stack,
      });

      throw new JamendoError(
        error.message || 'Failed to fetch trending tracks',
        error.statusCode || 500,
        error.code || 'TRENDING_ERROR'
      );
    }
  }
}

// Create a singleton instance of the JamendoService
const jamendoService = new JamendoService();

// Export the service instance
module.exports = jamendoService;
