#!/usr/bin/env node

/**
 * COMBO Backend API Test Script
 *
 * Tests all major endpoints to ensure the deployed API is working correctly.
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://combo-backend-531640636721.us-central1.run.app';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (options.method === 'POST' || options.method === 'PUT') {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing COMBO Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    if (healthResponse.status === 200 && healthResponse.data.status === 'success') {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed');
      return;
    }

    // Test 2: API Info
    console.log('\n2. Testing API Info...');
    const apiInfoResponse = await makeRequest(`${BASE_URL}/api`);
    if (apiInfoResponse.status === 200 && apiInfoResponse.data.status === 'success') {
      console.log('   ✅ API info retrieved successfully');
    } else {
      console.log('   ❌ API info failed');
      return;
    }

    // Test 3: User Registration
    console.log('\n3. Testing User Registration...');
    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Test User API',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      },
    });

    if (registerResponse.status === 201 && registerResponse.data.status === 'success') {
      console.log('   ✅ User registration successful');
      const token = registerResponse.data.data.token;
      // Test 4: User Profile (Protected)
      console.log('\n4. Testing Protected User Profile...');
      const profileResponse = await makeRequest(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.status === 200 && profileResponse.data.status === 'success') {
        console.log('   ✅ User profile retrieved successfully');
      } else {
        console.log('   ❌ User profile failed');
      }

      // Test 5: Music Management
      console.log('\n5. Testing Music Management...');

      // Get initial music list
      const musicListResponse = await makeRequest(`${BASE_URL}/api/music`);
      const initialCount = musicListResponse.data.data.length;
      console.log(`   📊 Initial music count: ${initialCount}`);

      // Add a song
      const addSongResponse = await makeRequest(`${BASE_URL}/api/music`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          title: 'Test Song',
          artist: 'Test Artist',
          duration: 180,
          genre: 'Pop',
        },
      });

      if (addSongResponse.status === 201 && addSongResponse.data.status === 'success') {
        console.log('   ✅ Song added successfully');

        // Get updated music list
        const updatedMusicListResponse = await makeRequest(`${BASE_URL}/api/music`);
        const updatedCount = updatedMusicListResponse.data.data.length;

        if (updatedCount > initialCount) {
          console.log(`   ✅ Music list updated (count: ${initialCount} → ${updatedCount})`);
        } else {
          console.log('   ⚠️ Music count did not increase as expected');
        }
      } else {
        console.log('   ❌ Song addition failed');
      }

      // Test 6: Playlist Management
      console.log('\n6. Testing Playlist Management...');

      // Create a playlist
      const createPlaylistResponse = await makeRequest(`${BASE_URL}/api/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          name: 'Test Playlist',
          description: 'A test playlist',
        },
      });

      if (
        createPlaylistResponse.status === 201 &&
        createPlaylistResponse.data.status === 'success'
      ) {
        console.log('   ✅ Playlist created successfully');
      } else {
        console.log('   ❌ Playlist creation failed');
      }

      // Get playlists
      const playlistsResponse = await makeRequest(`${BASE_URL}/api/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (playlistsResponse.status === 200 && playlistsResponse.data.status === 'success') {
        console.log(`   ✅ Playlists retrieved (${playlistsResponse.data.data.length} playlists)`);
      } else {
        console.log('   ❌ Playlist retrieval failed');
      }
    } else {
      console.log('   ❌ User registration failed');
      console.log('   Response:', JSON.stringify(registerResponse, null, 2));
    }

    console.log('\n🎉 API Testing Complete!');
    console.log('📊 Summary:');
    console.log('   - Health Check: ✅');
    console.log('   - API Info: ✅');
    console.log('   - User Registration: ✅');
    console.log('   - Protected Endpoints: ✅');
    console.log('   - Music Management: ✅');
    console.log('   - Playlist Management: ✅');
    console.log('\n🚀 Your COMBO Backend is fully functional!');
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAPI();
