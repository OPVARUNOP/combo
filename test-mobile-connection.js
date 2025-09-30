#!/usr/bin/env node

/**
 * Test Mobile App Backend Connection
 * This script tests if the mobile app can successfully connect to the backend
 */

const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const testConnection = async () => {
  console.log('???? Testing Mobile App Backend Connection...\n');

  try {
    // Test 1: Health check (root level endpoint)
    console.log('1. Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('   ??? Health check:', healthResponse.data.status);
    console.log('   ???? Message:', healthResponse.data.message);

    // Test 2: API endpoints (under /api)
    const apiClient = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Test search functionality
    console.log('\n2. Testing search endpoint...');
    const searchResponse = await apiClient.get('/music/search', {
      params: { q: 'rock', limit: 2, type: 'track' }
    });
    console.log('   ??? Search successful');
    console.log('   ???? Found', searchResponse.data.data.tracks?.length || 0, 'tracks');

    if (searchResponse.data.data.tracks && searchResponse.data.data.tracks.length > 0) {
      const firstTrack = searchResponse.data.data.tracks[0];
      console.log('   ???? Sample track:', `${firstTrack.title} by ${firstTrack.artist}`);
    }

    // Test trending functionality
    console.log('\n3. Testing trending endpoint...');
    const trendingResponse = await apiClient.get('/music/trending', {
      params: { limit: 2 }
    });
    console.log('   ??? Trending successful');
    console.log('   ???? Found', trendingResponse.data.data.tracks?.length || 0, 'trending tracks');

    // Test cache functionality
    console.log('\n4. Testing cache endpoints...');
    const cacheStatsResponse = await apiClient.get('/admin/cache/stats');
    console.log('   ??? Cache stats:', cacheStatsResponse.data.data.cache.connected ? 'Connected' : 'Not connected');

    const cacheClearResponse = await apiClient.post('/admin/cache/clear');
    console.log('   ??? Cache cleared:', cacheClearResponse.data.cleared ? 'Success' : 'Not cleared');

    // Test authentication endpoints
    console.log('\n5. Testing authentication endpoints...');
    const registerResponse = await apiClient.post('/auth/register', {
      email: 'test@example.com',
      password: 'testpass123',
      username: 'testuser'
    });
    console.log('   ??? Registration successful');
    console.log('   ???? User created:', registerResponse.data.data.user.username);

    const loginResponse = await apiClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'testpass123'
    });
    console.log('   ??? Login successful');
    console.log('   ???? Token received:', loginResponse.data.data.accessToken ? 'Yes' : 'No');

    // Test playlists
    console.log('\n6. Testing playlist endpoints...');
    const playlistsResponse = await apiClient.get('/music/playlists');
    console.log('   ??? Playlists retrieved');
    console.log('   ???? Found', playlistsResponse.data.data.playlists?.length || 0, 'playlists');

    console.log('\n???? ALL TESTS PASSED! Mobile app can successfully connect to backend.');
    console.log('\n???? Mobile App Integration Status: ??? COMPLETE');
    console.log('???? Backend URL: http://localhost:3001/api');
    console.log('???? Ready for mobile app development!');

  } catch (error) {
    console.error('\n??? CONNECTION TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('\n???? Please check:');
    console.error('   - Backend server is running on port 3001');
    console.error('   - All API endpoints are accessible');
    console.error('   - Network connectivity');
  }
};

// Run the test
testConnection();
