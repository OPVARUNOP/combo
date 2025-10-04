const firestoreService = require('../services/firestore.service');
const logger = require('../config/logger');

class FirestoreController {
  async testConnection(req, res, next) {
    try {
      // Test write
      const docId = await firestoreService.saveDocument('test', 'connection-test', {
        message: 'Test connection',
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      // Test read
      const doc = await firestoreService.getDocument('test', 'connection-test');

      // Clean up
      await firestoreService.deleteDocument('test', 'connection-test');

      res.status(200).json({
        success: true,
        message: 'Firestore connection successful',
        data: doc,
      });
    } catch (error) {
      logger.error('Firestore test failed:', error);
      next(error);
    }
  }

  // Add more controller methods as needed
  async createDocument(req, res, next) {
    try {
      const { collection, id, data } = req.body;
      const docId = await firestoreService.saveDocument(collection, id, data);

      res.status(201).json({
        success: true,
        id: docId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req, res, next) {
    try {
      const { collection, id } = req.params;
      const doc = await firestoreService.getDocument(collection, id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  async queryDocuments(req, res, next) {
    try {
      const { collection } = req.params;
      const { filters = [], options = {} } = req.body;

      const results = await firestoreService.query(collection, filters, options);

      res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FirestoreController();
