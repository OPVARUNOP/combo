require('dotenv').config();

console.log('Checking Backblaze B2 Configuration:');
console.log(
  'B2_ACCOUNT_ID:',
  process.env.B2_ACCOUNT_ID ? '***' + process.env.B2_ACCOUNT_ID.slice(-4) : 'Not set'
);
console.log(
  'B2_APPLICATION_KEY:',
  process.env.B2_APPLICATION_KEY ? '***' + process.env.B2_APPLICATION_KEY.slice(-4) : 'Not set'
);
console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME || 'Not set');
console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID || 'Not set');
console.log('B2_ENDPOINT:', process.env.B2_ENDPOINT || 'Not set');

// Simple test to see if we can require the b2 service
try {
  require('../src/services/b2-service');
  console.log('\nB2 Service loaded successfully');
} catch (error) {
  console.error('\nError loading B2 Service:', error.message);
}
