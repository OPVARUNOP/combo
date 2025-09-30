// Test Firebase Admin SDK integration
const admin = require('firebase-admin');

describe('Firebase Integration', () => {
  beforeAll(async () => {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      // This will use the same initialization as server.js
      require('./server');
    }
  });

  it('should initialize Firebase Admin SDK', () => {
    expect(admin.apps.length).toBeGreaterThan(0);
  });

  it('should have database access', async () => {
    const db = admin.firestore();
    expect(db).toBeDefined();
    
    // Test basic database operation
    const testDoc = db.collection('test').doc('connection-test');
    const testData = {
      testId: 'test_123',
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test',
      status: 'success'
    };
    
    await testDoc.set(testData);
    
    const doc = await testDoc.get();
    expect(doc.exists).toBe(true);
    expect(doc.data().status).toBe('success');
  });

  it('should have authentication access', () => {
    const auth = admin.auth();
    expect(auth).toBeDefined();
  });
});
