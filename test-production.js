#!/usr/bin/env node

const axios = require('axios');

// Replace with your actual Cloud Run URL
const PRODUCTION_URL = 'https://combo-backend-abc123-uc.a.run.app/api';

const api = axios.create({
  baseURL: PRODUCTION_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const testProduction = async () => {
  console.log('???? Testing Production Deployment...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('   ??? Health check:', healthResponse.data.status);

    // Test 2: Music Search
    console.log('2. Testing music search...');
    const searchResponse = await api.get('/music/search', {
      params: { q: 'rock', limit: 2 }
    });
    console.log('   ??? Search successful:', searchResponse.data.data.tracks?.length || 0, 'tracks');

    // Test 3: Trending
    console.log('3. Testing trending...');
    const trendingResponse = await api.get('/music/trending', {
      params: { limit: 2 }
    });
    console.log('   ??? Trending successful:', trendingResponse.data.data.tracks?.length || 0, 'tracks');

    // Test 4: Authentication
    console.log('4. Testing authentication...');
    const registerResponse = await api.post('/auth/register', {
      email: 'test@example.com',
      password: 'test123',
      username: 'testuser'
    });
    console.log('   ??? Registration successful');

    console.log('\n???? PRODUCTION DEPLOYMENT SUCCESSFUL!');
    console.log('???? Service URL:', PRODUCTION_URL);
    console.log('???? Ready for mobile app integration!');

  } catch (error) {
    console.error('\n??? PRODUCTION TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

testProduction();
