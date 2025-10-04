const { db, FieldValue } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class Playlist {
  constructor({
    id,
    name,
    description = '',
    owner,
    tracks = [],
    isPublic = true,
    coverImage = 'https://via.placeholder.com/300',
    followers = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.owner = owner; // Reference to user ID
    this.tracks = tracks; // Array of track IDs
    this.isPublic = isPublic;
    this.coverImage = coverImage;
    this.followers = followers; // Array of user IDs
    this.createdAt = createdAt instanceof Date ? createdAt : createdAt?.toDate() || new Date();
    this.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt?.toDate() || new Date();
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      owner: this.owner,
      tracks: this.tracks,
      isPublic: this.isPublic,
      coverImage: this.coverImage,
      followers: this.followers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Save playlist to Firestore
  async save() {
    const playlistRef = db.collection('playlists').doc(this.id);
    await playlistRef.set(
      {
        name: this.name,
        description: this.description,
        owner: this.owner,
        tracks: this.tracks,
        isPublic: this.isPublic,
        coverImage: this.coverImage,
        followers: this.followers,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return this;
  }

  // Delete playlist from Firestore
  async delete() {
    await db.collection('playlists').doc(this.id).delete();
  }

  // Add track to playlist
  async addTrack(trackId) {
    if (!this.tracks.includes(trackId)) {
      this.tracks.push(trackId);
      await db
        .collection('playlists')
        .doc(this.id)
        .update({
          tracks: FieldValue.arrayUnion(trackId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Remove track from playlist
  async removeTrack(trackId) {
    if (this.tracks.includes(trackId)) {
      this.tracks = this.tracks.filter((id) => id !== trackId);
      await db
        .collection('playlists')
        .doc(this.id)
        .update({
          tracks: FieldValue.arrayRemove(trackId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Add follower to playlist
  async addFollower(userId) {
    if (!this.followers.includes(userId)) {
      this.followers.push(userId);
      await db
        .collection('playlists')
        .doc(this.id)
        .update({
          followers: FieldValue.arrayUnion(userId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Remove follower from playlist
  async removeFollower(userId) {
    if (this.followers.includes(userId)) {
      this.followers = this.followers.filter((id) => id !== userId);
      await db
        .collection('playlists')
        .doc(this.id)
        .update({
          followers: FieldValue.arrayRemove(userId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Find playlist by ID
  static async findById(id) {
    const playlistDoc = await db.collection('playlists').doc(id).get();
    if (!playlistDoc.exists) {
      return null;
    }
    return new Playlist({ id: playlistDoc.id, ...playlistDoc.data() });
  }

  // Find playlists by query
  static async find(query = {}) {
    let playlistsRef = db.collection('playlists');

    // Apply filters
    if (query.owner) {
      playlistsRef = playlistsRef.where('owner', '==', query.owner);
    }

    if (query.isPublic !== undefined) {
      playlistsRef = playlistsRef.where('isPublic', '==', query.isPublic === 'true');
    }

    // Apply sorting
    if (query.sortBy) {
      const [field, order] = query.sortBy.split(':');
      playlistsRef = playlistsRef.orderBy(field, order || 'asc');
    } else {
      // Default sorting by creation date
      playlistsRef = playlistsRef.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    const snapshot = await playlistsRef.limit(limit).offset(offset).get();
    return snapshot.docs.map((doc) => new Playlist({ id: doc.id, ...doc.data() }));
  }

  // Get user's playlists (both public and private)
  static async getUserPlaylists(userId, options = {}) {
    let playlistsRef = db.collection('playlists').where('owner', '==', userId);

    // Apply additional filters if provided
    if (options.isPublic !== undefined) {
      playlistsRef = playlistsRef.where('isPublic', '==', options.isPublic);
    }

    // Apply sorting
    if (options.sortBy) {
      const [field, order] = options.sortBy.split(':');
      playlistsRef = playlistsRef.orderBy(field, order || 'asc');
    } else {
      // Default sorting by creation date
      playlistsRef = playlistsRef.orderBy('createdAt', 'desc');
    }

    const snapshot = await playlistsRef.get();
    return snapshot.docs.map((doc) => new Playlist({ id: doc.id, ...doc.data() }));
  }

  // Get public playlists
  static async getPublicPlaylists(options = {}) {
    let playlistsRef = db.collection('playlists').where('isPublic', '==', true);

    // Apply additional filters if provided
    if (options.owner) {
      playlistsRef = playlistsRef.where('owner', '==', options.owner);
    }

    // Apply sorting
    if (options.sortBy) {
      const [field, order] = options.sortBy.split(':');
      playlistsRef = playlistsRef.orderBy(field, order || 'asc');
    } else {
      // Default sorting by number of followers
      playlistsRef = playlistsRef.orderBy('followers', 'desc');
    }

    // Apply pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;

    const snapshot = await playlistsRef.limit(limit).offset(offset).get();
    return snapshot.docs.map((doc) => new Playlist({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Playlist;
