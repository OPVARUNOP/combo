const axios = require('axios');

const DATABASE_URL = 'https://combo-624e1-default-rtdb.firebaseio.com';
const DATABASE_SECRET = 'mqucsRC7MHfDLdYSbNTU1srwlK4l6RsOtKKgqB4m';

// Helper function to make authenticated requests to Firebase Realtime Database
async function firebaseRequest(method, path, data = null) {
  const url = `${DATABASE_URL}${path}.json?auth=${DATABASE_SECRET}`;

  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Firebase request failed:', {
      method,
      path,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw error;
  }
}

async function testRealtimeDatabase() {
  try {
    console.log('Testing Realtime Database connection...');

    // Test writing to the database
    const testData = {
      timestamp: new Date().toISOString(),
      status: 'success',
      message: 'Realtime Database connection test',
      method: 'using_database_secret_rest_api',
    };

    // Write data
    await firebaseRequest('put', '/connection-test', testData);
    console.log('✅ Successfully wrote to Realtime Database');

    // Read data back
    const data = await firebaseRequest('get', '/connection-test');
    console.log('📝 Test data:', JSON.stringify(data, null, 2));

    console.log('✅ Realtime Database tests completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Realtime Database test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Install axios if not already installed
if (!require.resolve('axios')) {
  console.log('Installing axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios --no-save', { stdio: 'inherit' });
    console.log('✅ axios installed successfully');
  } catch (error) {
    console.error('Failed to install axios:', error.message);
    process.exit(1);
  }
}

// Run the test
testRealtimeDatabase();
