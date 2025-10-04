const { v4: uuidv4 } = require('uuid');
const { db, isFirebaseInitialized } = require('../services/firebase');
const logger = require('../config/logger');

const COLLECTION_NAME = 'users';

class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.isEmailVerified = data.isEmailVerified || false;
    this.profilePicture = data.profilePicture || '';
    this.preferences = {
      theme: data.preferences?.theme || 'system',
      language: data.preferences?.language || 'en',
      explicitContent: data.preferences?.explicitContent || false,
    };
    this.likedSongs = data.likedSongs || [];
    this.followedArtists = data.followedArtists || [];
    this.followedPlaylists = data.followedPlaylists || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static get collection() {
    if (!isFirebaseInitialized) {
      throw new Error('Firebase is not initialized');
    }
    return db.collection(COLLECTION_NAME);
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>}
   */
  static async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<User|null>}
   */
  static async findOne(query) {
    try {
      const snapshot = await this.collection.where('email', '==', query.email).limit(1).get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>}
   */
  static async create(userData) {
    try {
      const now = new Date().toISOString();
      const user = new User({
        ...userData,
        createdAt: now,
        updatedAt: now,
      });

      await this.collection.doc(user.id).set({
        ...user.toJSON(),
        id: undefined, // Don't store the id in the document
      });

      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Save user data
   * @returns {Promise<User>}
   */
  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      await User.collection.doc(this.id).update({
        ...this.toJSON(),
        id: undefined, // Don't update the id
      });
      return this;
    } catch (error) {
      logger.error(`Error saving user ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Check if email is already in use
   * @param {string} email - Email to check
   * @param {string} [excludeUserId] - User ID to exclude from the check
   * @returns {Promise<boolean>}
   */
  static async isEmailTaken(email, excludeUserId) {
    try {
      const snapshot = await this.collection.where('email', '==', email).get();

      return (
        !snapshot.empty &&
        (excludeUserId ? snapshot.docs.some((doc) => doc.id !== excludeUserId) : true)
      );
    } catch (error) {
      logger.error('Error checking if email is taken:', error);
      throw error;
    }
  }

  /**
   * Convert user to JSON
   * @returns {Object}
   */
  toJSON() {
    const user = { ...this };
    // Remove any sensitive data before sending to client
    delete user.password;
    return user;
  }

  /**
   * Add a song to liked songs
   * @param {string} songId - Song ID to add
   * @returns {Promise<void>}
   */
  async addLikedSong(songId) {
    if (!this.likedSongs.includes(songId)) {
      this.likedSongs = [...this.likedSongs, songId];
      await this.save();
    }
  }

  /**
   * Remove a song from liked songs
   * @param {string} songId - Song ID to remove
   * @returns {Promise<void>}
   */
  async removeLikedSong(songId) {
    this.likedSongs = this.likedSongs.filter((id) => id !== songId);
    await this.save();
  }

  /**
   * Follow an artist
   * @param {string} artistId - Artist ID to follow
   * @returns {Promise<void>}
   */
  async followArtist(artistId) {
    if (!this.followedArtists.includes(artistId)) {
      this.followedArtists = [...this.followedArtists, artistId];
      await this.save();
    }
  }

  /**
   * Unfollow an artist
   * @param {string} artistId - Artist ID to unfollow
   * @returns {Promise<void>}
   */
  async unfollowArtist(artistId) {
    this.followedArtists = this.followedArtists.filter((id) => id !== artistId);
    await this.save();
  }
}

module.exports = User;
