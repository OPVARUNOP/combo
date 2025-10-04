const request = require('supertest');
const app = require('../src/app');
async function testFirestoreIntegration() {
  try {
    console.log('🚀 Testing Firestore integration...');

    // 1. Test connection
    console.log('\n🔍 Testing connection...');
    const testRes = await request(app).get('/api/firestore/test').expect(200);

    console.log('✅ Connection test passed:', testRes.body.message);

    // 2. Test document creation
    console.log('\n✏️  Testing document creation...');
    const testDoc = {
      name: 'Test Document',
      description: 'This is a test document',
      count: 1,
      active: true,
      tags: ['test', 'integration'],
      createdAt: new Date().toISOString(),
    };

    const createRes = await request(app)
      .post('/api/firestore/test-collection/test-doc-1')
      .send({ data: testDoc })
      .expect(201);

    console.log('✅ Document created with ID:', createRes.body.id);

    // 3. Test document retrieval
    console.log('\n📖 Testing document retrieval...');
    const getRes = await request(app).get('/api/firestore/test-collection/test-doc-1').expect(200);

    console.log('✅ Document retrieved successfully');
    console.log('   Document data:', JSON.stringify(getRes.body.data, null, 2));

    // 4. Test query
    console.log('\n🔍 Testing document query...');
    const queryRes = await request(app)
      .post('/api/firestore/query/test-collection')
      .send({
        filters: [
          ['active', '==', true],
          ['count', '>', 0],
        ],
        options: {
          orderBy: { field: 'createdAt', direction: 'desc' },
          limit: 10,
        },
      })
      .expect(200);

    console.log(`✅ Query returned ${queryRes.body.count} documents`);

    console.log('\n🎉 All Firestore integration tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', error.response.body);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the tests
testFirestoreIntegration();
