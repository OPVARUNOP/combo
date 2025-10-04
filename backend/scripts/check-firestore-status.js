const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../config/firebase-service-account.json');

async function checkFirestoreStatus() {
  try {
    console.log('🔍 Checking Firestore database status...');

    const firestore = new Firestore({
      projectId: 'combo-624e1',
      credentials: serviceAccount,
    });

    console.log('✅ Firestore client initialized');

    // Try to get database info
    console.log('\n🔍 Getting database info...');
    const [databases] = await firestore.listDatabases();

    console.log('✅ Database info:');
    console.log(JSON.stringify(databases, null, 2));

    // Try to list collections
    console.log('\n🔍 Listing collections...');
    const collections = await firestore.listCollections();
    console.log(`✅ Found ${collections.length} collections`);

    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach((collection) => console.log(`- ${collection.id}`));
    }
  } catch (error) {
    console.error('\n❌ Error checking Firestore status:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);

    if (error.code === 5 || error.code === '5' || error.message.includes('NOT_FOUND')) {
      console.log('\n🔴 Firestore database is not properly initialized.');
      console.log('Please follow these steps to initialize Firestore:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Select your project (combo-624e1)');
      console.log('3. In the left menu, click on "Firestore" under "Databases"');
      console.log('4. Click "Select Native Mode"');
      console.log('5. Choose a location (e.g., us-central1)');
      console.log('6. Click "Create Database"');
    }

    process.exit(1);
  }
}

checkFirestoreStatus();
