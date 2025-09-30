const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    this.DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://combo-624e1-default-rtdb.firebaseio.com';
    this.DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || 'mqucsRC7MHfDLdYSbNTU1srwlK4l6RsOtKKgqB4m';
    this.axios = axios.create({
      baseURL: this.DATABASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        auth: this.DATABASE_SECRET,
      },
    });
  }

  /**
   * Helper method to make authenticated requests to Firebase Realtime Database
   * @param {string} method - HTTP method (get, post, put, patch, delete)
   * @param {string} path - Database path (e.g., '/users/123')
   * @param {Object} [data] - Data to send with the request
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise<Object>} - Response data
   */
  async _request(method, path, data = null, params = {}) {
    try {
      const response = await this.axios({
        method,
        url: `${path}.json`,
        data,
        params: { ...params, auth: this.DATABASE_SECRET },
      });
      return response.data;
    } catch (error) {
      console.error('Database request failed:', {
        method,
        path,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  // CRUD Operations

  /**
   * Get data from a specific path
   * @param {string} path - Path to the data (e.g., 'users/123')
   * @param {Object} [params] - Query parameters (e.g., orderBy, limitToFirst, etc.)
   * @returns {Promise<Object>} - The data at the specified path
   */
  async get(path, params = {}) {
    return this._request('get', `/${path}`, null, params);
  }

  /**
   * Set data at a specific path (overwrites existing data)
   * @param {string} path - Path where to write the data
   * @param {Object} data - Data to write
   * @returns {Promise<Object>} - The written data
   */
  async set(path, data) {
    return this._request('put', `/${path}`, data);
  }

  /**
   * Update specific fields at a path (merges with existing data)
   * @param {string} path - Path to update
   * @param {Object} updates - Object with fields to update
   * @returns {Promise<Object>} - The updated data
   */
  async update(path, updates) {
    return this._request('patch', `/${path}`, updates);
  }

  /**
   * Push data to a list (generates a unique key)
   * @param {string} path - Path to the list
   * @param {Object} data - Data to push
   * @returns {Promise<{key: string}>} - The generated key and the data
   */
  async push(path, data) {
    const result = await this._request('post', `/${path}`, data);
    return { key: result.name, ...data };
  }

  /**
   * Remove data at a specific path
   * @param {string} path - Path to the data to remove
   * @returns {Promise<null>}
   */
  async remove(path) {
    return this._request('delete', `/${path}`);
  }

  // Query Methods

  /**
   * Check if a path exists
   * @param {string} path - Path to check
   * @returns {Promise<boolean>} - True if the path exists
   */
  async exists(path) {
    const data = await this.get(path);
    return data !== null && data !== undefined;
  }

  /**
   * Get all items in a list
   * @param {string} path - Path to the list
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Array>} - Array of items with their keys
   */
  async list(path, params = {}) {
    const data = await this.get(path, params);
    if (!data) return [];

    // Convert object to array of items with their keys
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  /**
   * Find items that match a query
   * @param {string} path - Path to search in
   * @param {string} field - Field to query
   * @param {string} operator - Query operator ('==', '>', '<', '>=', '<=', '!=', 'in', 'not-in')
   * @param {*} value - Value to compare against
   * @returns {Promise<Array>} - Matching items
   */
  async find(path, field, operator, value) {
    const params = {
      orderBy: `"${field}"`,
      equalTo: operator === '==' ? `"${value}"` : value,
    };

    const data = await this.get(path, params);
    if (!data) return [];

    return Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  /**
   * Search for items containing a string in specified fields
   * @param {string} path - Path to search in
   * @param {string} query - Search query
   * @param {Array<string>} fields - Fields to search in
   * @returns {Promise<Array>} - Matching items
   */
  async search(path, query, fields = ['title', 'name']) {
    const allItems = await this.list(path);
    if (!query || query.trim() === '') return allItems;

    const searchTerm = query.toLowerCase().trim();

    return allItems.filter(item => {
      return fields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm);
      });
    });
  }

  /**
   * Generate a unique ID
   * @returns {string} - A unique ID
   */
  generateId() {
    return uuidv4();
  }

  // User Management Methods

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  async getUser(userId) {
    return await this.get(`users/${userId}`);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user with ID
   */
  async createUser(userData) {
    const userId = this.generateId();
    const user = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.set(`users/${userId}`, user);
    return user;
  }

  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUser(userId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.update(`users/${userId}`, updatedData);
    return await this.getUser(userId);
  }

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    await this.remove(`users/${userId}`);
  }

  /**
   * Find users by email
   * @param {string} email - Email to search for
   * @returns {Promise<Array>} - Array of matching users
   */
  async findUserByEmail(email) {
    return await this.find('users', 'email', '==', email);
  }

  // Song Management Methods

  /**
   * Get all songs
   * @returns {Promise<Array>} - Array of all songs
   */
  async getAllSongs() {
    return await this.list('songs');
  }

  /**
   * Get song by ID
   * @param {string} songId - Song ID
   * @returns {Promise<Object|null>} - Song data or null if not found
   */
  async getSong(songId) {
    return await this.get(`songs/${songId}`);
  }

  /**
   * Create a new song
   * @param {Object} songData - Song data
   * @returns {Promise<Object>} - Created song with ID
   */
  async createSong(songData) {
    const songId = this.generateId();
    const song = {
      id: songId,
      ...songData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.set(`songs/${songId}`, song);
    return song;
  }

  /**
   * Update song data
   * @param {string} songId - Song ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated song data
   */
  async updateSong(songId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.update(`songs/${songId}`, updatedData);
    return await this.getSong(songId);
  }

  /**
   * Delete a song
   * @param {string} songId - Song ID
   * @returns {Promise<void>}
   */
  async deleteSong(songId) {
    await this.remove(`songs/${songId}`);
  }

  /**
   * Search songs by title, artist, or genre
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of matching songs
   */
  async searchSongs(query) {
    return await this.search('songs', query, ['title', 'artist', 'genre']);
  }

  /**
   * Get songs by artist
   * @param {string} artist - Artist name
   * @returns {Promise<Array>} - Array of songs by the artist
   */
  async getSongsByArtist(artist) {
    return await this.find('songs', 'artist', '==', artist);
  }

  /**
   * Get songs by genre
   * @param {string} genre - Genre name
   * @returns {Promise<Array>} - Array of songs in the genre
   */
  async getSongsByGenre(genre) {
    return await this.find('songs', 'genre', '==', genre);
  }

  // Playlist Management Methods

  /**
   * Get all playlists
   * @returns {Promise<Array>} - Array of all playlists
   */
  async getAllPlaylists() {
    return await this.list('playlists');
  }

  /**
   * Get playlist by ID
   * @param {string} playlistId - Playlist ID
   * @returns {Promise<Object|null>} - Playlist data or null if not found
   */
  async getPlaylist(playlistId) {
    return await this.get(`playlists/${playlistId}`);
  }

  /**
   * Create a new playlist
   * @param {Object} playlistData - Playlist data
   * @returns {Promise<Object>} - Created playlist with ID
   */
  async createPlaylist(playlistData) {
    const playlistId = this.generateId();
    const playlist = {
      id: playlistId,
      ...playlistData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.set(`playlists/${playlistId}`, playlist);
    return playlist;
  }

  /**
   * Update playlist data
   * @param {string} playlistId - Playlist ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated playlist data
   */
  async updatePlaylist(playlistId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.update(`playlists/${playlistId}`, updatedData);
    return await this.getPlaylist(playlistId);
  }

  /**
   * Delete a playlist
   * @param {string} playlistId - Playlist ID
   * @returns {Promise<void>}
   */
  async deletePlaylist(playlistId) {
    await this.remove(`playlists/${playlistId}`);
  }

  /**
   * Add song to playlist
   * @param {string} playlistId - Playlist ID
   * @param {string} songId - Song ID
   * @returns {Promise<Object>} - Updated playlist
   */
  async addSongToPlaylist(playlistId, songId) {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (!playlist.songs) {
      playlist.songs = [];
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await this.updatePlaylist(playlistId, playlist);
    }

    return await this.getPlaylist(playlistId);
  }

  /**
   * Remove song from playlist
   * @param {string} playlistId - Playlist ID
   * @param {string} songId - Song ID
   * @returns {Promise<Object>} - Updated playlist
   */
  async removeSongFromPlaylist(playlistId, songId) {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.songs) {
      playlist.songs = playlist.songs.filter(id => id !== songId);
      await this.updatePlaylist(playlistId, playlist);
    }

    return await this.getPlaylist(playlistId);
  }

  /**
   * Get user's playlists
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of user's playlists
   */
  async getUserPlaylists(userId) {
    return await this.find('playlists', 'createdBy', '==', userId);
  }
}

// Create a singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
