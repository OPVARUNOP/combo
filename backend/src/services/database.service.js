const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    if (!admin.apps.length) {
      const serviceAccount = require('../../config/firebase-service-account.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    this.db = admin.firestore();
  }

  /**
   * Helper method to get a document reference
   * @param {string} collection - Collection name
   * @param {string} [id] - Document ID (optional)
   * @returns {FirebaseFirestore.DocumentReference}
   */
  _doc(collection, id) {
    if (id) {
      return this.db.collection(collection).doc(id);
    }
    return this.db.collection(collection).doc();
  }

  /**
   * Helper method to get a collection reference
   * @param {string} collection - Collection name
   * @returns {FirebaseFirestore.CollectionReference}
   */
  _collection(collection) {
    return this.db.collection(collection);
  }

  /**
   * Helper method to convert Firestore document to plain object
   * @param {FirebaseFirestore.DocumentSnapshot} doc - Firestore document
   * @returns {Object} - Plain object with id
   */
  _toObject(doc) {
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Helper method to convert Firestore query snapshot to array of objects
   * @param {FirebaseFirestore.QuerySnapshot} snapshot - Firestore query snapshot
   * @returns {Array<Object>} - Array of plain objects with ids
   */
  _toArray(snapshot) {
    const result = [];
    snapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });
    return result;
  }

  // ==================== CRUD Operations ====================

  /**
   * Get a document by ID
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<Object>} - Document data or null if not found
   */
  async getById(collection, id) {
    const doc = await this._doc(collection, id).get();
    return this._toObject(doc);
  }

  /**
   * Get all documents in a collection
   * @param {string} collection - Collection name
   * @param {Object} [query] - Query constraints (where, orderBy, limit, etc.)
   * @returns {Promise<Array<Object>>} - Array of documents
   */
  async getAll(collection, query = {}) {
    let ref = this._collection(collection);

    // Apply where clauses
    if (query.where) {
      query.where.forEach(([field, op, value]) => {
        ref = ref.where(field, op, value);
      });
    }

    // Apply orderBy
    if (query.orderBy) {
      ref = ref.orderBy(query.orderBy, query.orderDir || 'asc');
    }

    // Apply limit
    if (query.limit) {
      ref = ref.limit(query.limit);
    }

    const snapshot = await ref.get();
    return this._toArray(snapshot);
  }

  /**
   * Create a new document
   * @param {string} collection - Collection name
   * @param {Object} data - Document data
   * @param {string} [id] - Optional document ID
   * @returns {Promise<string>} - The ID of the created document
   */
  async create(collection, data, id = null) {
    const docRef = this._doc(collection, id || uuidv4());
    await docRef.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Update a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async update(collection, id, data) {
    await this._doc(collection, id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Delete a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<void>}
   */
  async delete(collection, id) {
    await this._doc(collection, id).delete();
  }

  // ==================== User Operations ====================

  /**
   * Get a user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User data or null if not found
   */
  async getUser(userId) {
    return this.getById('users', userId);
  }

  /**
   * Create or update a user
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   * @returns {Promise<string>} - The ID of the user
   */
  async setUser(userId, userData) {
    const userRef = this._doc('users', userId);
    await userRef.set(
      {
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return userId;
  }

  /**
   * Find a user by email
   * @param {string} email - User's email
   * @returns {Promise<Array<Object>>} - Array of users with the given email (should be 0 or 1)
   */
  async findUserByEmail(email) {
    const snapshot = await this._collection('users').where('email', '==', email).limit(1).get();

    return this._toArray(snapshot);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - The created user
   */
  async createUser(userData) {
    const userId = await this.create('users', userData);
    return this.getUser(userId);
  }
}

// Create a singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
