const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class BaseModel {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName;
  }

  async create(data) {
    const id = data.id || uuidv4();
    const now = new Date();

    const docData = {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    await this.collection.doc(id).set(docData);
    return { id, ...docData };
  }

  async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(id, data) {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
    return this.findById(id);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return { success: true, id };
  }

  async findOne(query) {
    let ref = this.collection;

    Object.entries(query).forEach(([key, value]) => {
      ref = ref.where(key, '==', value);
    });

    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async find(query = {}, options = {}) {
    let ref = this.collection;

    // Apply where clauses
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        ref = ref.where(key, value[0], value[1]);
      } else {
        ref = ref.where(key, '==', value);
      }
    });

    // Apply sorting
    if (options.orderBy) {
      ref = ref.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
    }

    // Apply pagination
    if (options.limit) {
      ref = ref.limit(options.limit);
    }

    const snapshot = await ref.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}

module.exports = BaseModel;
