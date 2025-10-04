const { admin, db, auth, isFirebaseInitialized } = require('./firebase');
const config = require('../../config/config');
const logger = require('../config/logger');

class FirebaseService {
  constructor() {
    if (!isFirebaseInitialized) {
      logger.warn('Firebase is not initialized. Running in limited mode.');
      this.db = null;
      this.auth = null;
      this.isInitialized = false;
    } else {
      this.db = db;
      this.auth = auth;
      this.isInitialized = true;
    }
  }

  // Add a method to check if Firebase is available
  isAvailable() {
    return this.isInitialized && this.db !== null && this.auth !== null;
  }

  // User Management
  async createUser(userData) {
    if (!this.isAvailable()) {
      throw new Error('Firebase Authentication is not available');
    }

    try {
      const { email, password, displayName } = userData;
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });

      // Create user document in Firestore if available
      if (this.db) {
        await this.db.collection('users').doc(userRecord.uid).set({
          email,
          displayName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return userRecord;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(uid) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      const userDoc = await this.db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  async findUserByEmail(email) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      const snapshot = await this.db.collection('users').where('email', '==', email).limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Generic Document Operations
  async getDocument(collection, docId) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      const doc = await this.db.collection(collection).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error getting document ${docId} from ${collection}:`, error);
      throw error;
    }
  }

  async addDocument(collection, data, id = null) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      const docRef = id
        ? this.db.collection(collection).doc(id)
        : this.db.collection(collection).doc();

      await docRef.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { id: docRef.id, ...data };
    } catch (error) {
      logger.error(`Error adding document to ${collection}:`, error);
      throw error;
    }
  }

  async updateDocument(collection, docId, data) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      await this.db
        .collection(collection)
        .doc(docId)
        .update({
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      return { id: docId, ...data };
    } catch (error) {
      logger.error(`Error updating document ${docId} in ${collection}:`, error);
      throw error;
    }
  }

  async deleteDocument(collection, docId) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      await this.db.collection(collection).doc(docId).delete();
      return true;
    } catch (error) {
      logger.error(`Error deleting document ${docId} from ${collection}:`, error);
      throw error;
    }
  }

  // Query Operations
  async queryCollection(collection, conditions = [], orderBy = null, limit = null) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    try {
      let query = this.db.collection(collection);

      // Apply where conditions
      conditions.forEach((condition) => {
        const { field, operator, value } = condition;
        query = query.where(field, operator, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error(`Error querying collection ${collection}:`, error);
      throw error;
    }
  }

  // Batch Operations
  async batchOperation(operations) {
    if (!this.isAvailable() || !this.db) {
      throw new Error('Firebase Firestore is not available');
    }

    const batch = this.db.batch();

    operations.forEach((op) => {
      const { type, collection, id, data } = op;
      const docRef = this.db.collection(collection).doc(id);

      switch (type) {
        case 'set':
          batch.set(docRef, data);
          break;
        case 'update':
          batch.update(docRef, data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        default:
          throw new Error(`Unsupported batch operation type: ${type}`);
      }
    });

    return batch.commit();
  }
}

module.exports = new FirebaseService();
