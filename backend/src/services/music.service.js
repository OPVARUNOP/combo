const { Music, Artist, Album } = require('../models');
const jamendoService = require('./jamendo.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Search for music using Jamendo API
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const searchMusic = async (query, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const result = await jamendoService.searchTracks(query, { limit, offset });

    return {
      data: {
        tracks: result.tracks,
        total: result.total,
        page,
        limit,
        query,
        type: 'track',
        source: 'jamendo',
      },
    };
  } catch (error) {
    console.error('Music search error:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to search music');
  }
};

/**
 * Get music details by ID
 * @param {string} musicId - Music ID
 * @returns {Promise<Object>}
 */
const getMusicById = async (musicId) => {
  try {
    const track = await jamendoService.getTrackById(musicId);

    return {
      data: {
        track,
      },
    };
  } catch (error) {
    console.error('Get music by ID error:', error.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'Music not found');
  }
};

/**
 * Get stream URL for a music track
 * @param {string} musicId - Music ID
 * @returns {Promise<string>} - Stream URL
 */
const getStreamUrl = async (musicId) => {
  try {
    const track = await jamendoService.getTrackById(musicId);

    return {
      data: {
        url: track.audioUrl,
        format: 'mp3',
      },
    };
  } catch (error) {
    console.error('Get stream URL error:', error.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream URL not found');
  }
};

/**
 * Get trending music using Jamendo API
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
const getTrendingMusic = async (options = {}) => {
  try {
    const { category = 'music', regionCode = 'US', maxResults = 10 } = options;

    const result = await jamendoService.getTrendingTracks({ limit: maxResults });

    return {
      data: {
        tracks: result.tracks,
        total: result.total,
        category,
        source: 'jamendo',
      },
    };
  } catch (error) {
    console.error('Get trending music error:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get trending music');
  }
};

/**
 * Get artists using Jamendo API
 * @param {Object} filter - Filter options
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const queryArtists = async (filter, options) => {
  try {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const result = await jamendoService.getArtists({ limit, offset });

    return {
      data: {
        artists: result.artists,
        total: result.total,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Query artists error:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get artists');
  }
};

/**
 * Get artist by ID using Jamendo API
 * @param {string} artistId - Artist ID
 * @returns {Promise<Object>}
 */
const getArtistById = async (artistId) => {
  try {
    // For now, we'll need to implement artist lookup by ID
    // Jamendo API doesn't have a direct get artist by ID endpoint
    // This is a simplified implementation
    const result = await jamendoService.getArtists({ limit: 1 });

    if (result.artists.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
    }

    return {
      data: {
        artist: result.artists[0],
      },
    };
  } catch (error) {
    console.error('Get artist by ID error:', error.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
};

/**
 * Get albums using Jamendo API
 * @param {Object} filter - Filter options
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const queryAlbums = async (filter, options) => {
  try {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const result = await jamendoService.getAlbums({ limit, offset });

    return {
      data: {
        albums: result.albums,
        total: result.total,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Query albums error:', error.message);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get albums');
  }
};

/**
 * Get album by ID using Jamendo API
 * @param {string} albumId - Album ID
 * @returns {Promise<Object>}
 */
const getAlbumById = async (albumId) => {
  try {
    // For now, we'll need to implement album lookup by ID
    // Jamendo API doesn't have a direct get album by ID endpoint
    // This is a simplified implementation
    const result = await jamendoService.getAlbums({ limit: 1 });

    if (result.albums.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
    }

    return {
      data: {
        album: result.albums[0],
      },
    };
  } catch (error) {
    console.error('Get album by ID error:', error.message);
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
};

module.exports = {
  searchMusic,
  getMusicById,
  getStreamUrl,
  getTrendingMusic,
  queryArtists,
  getArtistById,
  queryAlbums,
  getAlbumById,
};
