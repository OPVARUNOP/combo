const { db, FieldValue } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class Track {
  constructor({
    id,
    title,
    artist,
    album = null,
    duration,
    genre = [],
    audioUrl,
    coverImage = 'https://via.placeholder.com/300',
    plays = 0,
    likes = [],
    isExplicit = false,
    releaseDate = new Date(),
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id || uuidv4();
    this.title = title;
    this.artist = artist; // Reference to user ID
    this.album = album; // Reference to album ID
    this.duration = duration;
    this.genre = Array.isArray(genre) ? genre : [genre];
    this.audioUrl = audioUrl;
    this.coverImage = coverImage;
    this.plays = plays;
    this.likes = likes; // Array of user IDs
    this.isExplicit = isExplicit;
    this.releaseDate =
      releaseDate instanceof Date ? releaseDate : releaseDate?.toDate() || new Date();
    this.createdAt = createdAt instanceof Date ? createdAt : createdAt?.toDate() || new Date();
    this.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt?.toDate() || new Date();
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      album: this.album,
      duration: this.duration,
      genre: this.genre,
      audioUrl: this.audioUrl,
      coverImage: this.coverImage,
      plays: this.plays,
      likes: this.likes,
      isExplicit: this.isExplicit,
      releaseDate: this.releaseDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Save track to Firestore
  async save() {
    const trackRef = db.collection('tracks').doc(this.id);
    await trackRef.set(
      {
        title: this.title,
        artist: this.artist,
        album: this.album,
        duration: this.duration,
        genre: this.genre,
        audioUrl: this.audioUrl,
        coverImage: this.coverImage,
        plays: this.plays,
        likes: this.likes,
        isExplicit: this.isExplicit,
        releaseDate: this.releaseDate,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return this;
  }

  // Delete track from Firestore
  async delete() {
    await db.collection('tracks').doc(this.id).delete();
  }

  // Increment play count
  async incrementPlays() {
    this.plays += 1;
    await db
      .collection('tracks')
      .doc(this.id)
      .update({
        plays: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return this;
  }

  // Add like from user
  async addLike(userId) {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
      await db
        .collection('tracks')
        .doc(this.id)
        .update({
          likes: FieldValue.arrayUnion(userId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Remove like from user
  async removeLike(userId) {
    if (this.likes.includes(userId)) {
      this.likes = this.likes.filter((id) => id !== userId);
      await db
        .collection('tracks')
        .doc(this.id)
        .update({
          likes: FieldValue.arrayRemove(userId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Find track by ID
  static async findById(id) {
    const trackDoc = await db.collection('tracks').doc(id).get();
    if (!trackDoc.exists) {
      return null;
    }
    return new Track({ id: trackDoc.id, ...trackDoc.data() });
  }

  // Find tracks by query
  static async find(query = {}) {
    let tracksRef = db.collection('tracks');

    // Apply filters
    if (query.artist) {
      tracksRef = tracksRef.where('artist', '==', query.artist);
    }

    if (query.genre) {
      tracksRef = tracksRef.where('genre', 'array-contains', query.genre);
    }

    // Apply sorting
    if (query.sortBy) {
      const [field, order] = query.sortBy.split(':');
      tracksRef = tracksRef.orderBy(field, order || 'asc');
    }

    // Apply pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;

    const snapshot = await tracksRef.limit(limit).offset(offset).get();
    return snapshot.docs.map((doc) => new Track({ id: doc.id, ...doc.data() }));
  }

  // Search tracks by title or artist name
  static async search(term) {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation, consider using Algolia or similar for production
    const tracksRef = db.collection('tracks');
    const snapshot = await tracksRef
      .where('title', '>=', term)
      .where('title', '<=', term + '\uf8ff')
      .get();

    return snapshot.docs.map((doc) => new Track({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Track;
