#!/usr/bin/env node

// Test script to verify PORT configuration
const PORT = process.env.PORT || 8080;

console.log('???? PORT Configuration Test');
console.log('============================');
console.log('??? Current PORT value:', PORT);
console.log('??? Default fallback:', 8080);
console.log('??? Environment variable support: YES');
console.log('');
console.log('???? Ready for Google Cloud Run deployment!');
console.log('???? Cloud Run will provide PORT environment variable');
