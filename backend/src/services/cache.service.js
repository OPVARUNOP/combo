const { Timestamp } = require('@google-cloud/firestore');
const firestore = require('./firestore.service');
const logger = require('../config/logger');

class CacheService {
  constructor() {
    this.collectionName = 'cache';
    this.defaultTTL = 3600; // 1 hour in seconds
    this.isAvailable = true;

    // Test connection
    this.testConnection();
  }

  async testConnection() {
    try {
      await firestore.getDocument(this.collectionName, 'connection-test');
      logger.info('✅ Firestore cache service initialized');
      this.isAvailable = true;
    } catch (error) {
      logger.error('Failed to initialize Firestore cache service:', error);
      this.isAvailable = false;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isAvailable) return false;

    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttl);

      await firestore.saveDocument(this.collectionName, key, {
        value: JSON.stringify(value),
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now(),
      });

      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    if (!this.isAvailable) return null;

    try {
      const doc = await firestore.getDocument(this.collectionName, key);

      if (!doc || !doc.expiresAt || doc.expiresAt.toDate() < new Date()) {
        if (doc) await this.del(key);
        return null;
      }

      return JSON.parse(doc.value);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async del(key) {
    if (!this.isAvailable) return false;

    try {
      await firestore.deleteDocument(this.collectionName, key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async flush(pattern = '') {
    if (!this.isAvailable) return false;

    try {
      const snapshot = await firestore.firestore
        .collection(this.collectionName)
        .where('__name__', '>=', pattern)
        .get();

      const batch = firestore.firestore.batch();
      const batchSize = 500;
      let batchCount = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;

        if (batchCount >= batchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async getStats() {
    if (!this.isAvailable) return { total: 0, expired: 0, size: 0 };

    try {
      const now = new Date();
      const snapshot = await firestore.firestore
        .collection(this.collectionName)
        .select('expiresAt')
        .get();

      let total = 0;
      let expired = 0;

      snapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        if (data.expiresAt && data.expiresAt.toDate() < now) {
          expired++;
        }
      });

      return {
        total,
        expired,
        size: total * 1000, // Approximate size in bytes
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { total: 0, expired: 0, size: 0 };
    }
  }
}

// Create and export singleton instance
const cacheService = new CacheService();
module.exports = cacheService;
