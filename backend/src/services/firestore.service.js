const { Firestore } = require('@google-cloud/firestore');
const config = require('../config/config');
const logger = require('../config/logger');

class FirestoreService {
  constructor() {
    if (!config.firebase?.projectId) {
      throw new Error('Firebase project configuration is missing');
    }

    const firebaseConfig = {
      projectId: config.firebase.projectId,
      credentials: {},
    };

    if (config.firebase.privateKey && config.firebase.clientEmail) {
      firebaseConfig.credentials = {
        client_email: config.firebase.clientEmail,
        private_key: config.firebase.privateKey,
      };
    } else if (config.firebase.databaseSecret) {
      firebaseConfig.credentials = {
        client_email: 'firebase-adminsdk@combo-music-app.iam.gserviceaccount.com',
        private_key: config.firebase.databaseSecret,
      };
    } else {
      throw new Error(
        'Firebase credentials not found. Please provide either a service account or database secret.'
      );
    }

    this.firestore = new Firestore(firebaseConfig);
    logger.info(`Firestore service initialized for project: ${config.firebase.projectId}`);
  }

  /**
   * Get a document from a collection
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} - Document data or null if not found
   */
  async getDocument(collection, id) {
    try {
      const docRef = this.firestore.collection(collection).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error getting document ${collection}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Add or update a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID (if empty, auto-generated)
   * @param {Object} data - Document data
   * @param {boolean} merge - Whether to merge with existing document
   * @returns {Promise<string>} - Document ID
   */
  async saveDocument(collection, id, data, merge = true) {
    try {
      const collectionRef = this.firestore.collection(collection);
      const docRef = id ? collectionRef.doc(id) : collectionRef.doc();

      await docRef.set(data, { merge });
      return docRef.id;
    } catch (error) {
      logger.error(`Error saving document to ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(collection, id) {
    try {
      await this.firestore.collection(collection).doc(id).delete();
    } catch (error) {
      logger.error(`Error deleting document ${collection}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with filters
   * @param {string} collection - Collection name
   * @param {Array} queryParams - Array of [field, operator, value] arrays
   * @param {Object} options - Additional options (limit, orderBy, etc.)
   * @returns {Promise<Array>} - Array of matching documents
   */
  async query(collection, queryParams = [], options = {}) {
    try {
      let query = this.firestore.collection(collection);

      // Apply filters
      queryParams.forEach(([field, operator, value]) => {
        query = query.where(field, operator, value);
      });

      // Apply sorting
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error(`Error querying ${collection}:`, error);
      throw error;
    }
  }
}

module.exports = new FirestoreService();
