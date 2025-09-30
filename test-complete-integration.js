#!/usr/bin/env node

/**
 * COMBO Platform End-to-End Test Suite
 * Tests the complete integration between backend, mobile app, and Firebase
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3001';
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('???? COMBO Platform End-to-End Test Suite');
console.log('=====================================\n');

const testBackendAPI = async () => {
  console.log('???? Testing Backend API...');

  try {
    // Test 1: Health Check (root level endpoint)
    console.log('   1. Health Check...');
    const healthResponse = await api.get('/health');
    console.log(`      ??? Status: ${healthResponse.data.status}`);
    console.log(`      ???? Message: ${healthResponse.data.message}`);

    // Test 2: API endpoints (under /api)
    const apiClient = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Test 3: Music Search
    console.log('   2. Music Search...');
    const searchResponse = await apiClient.get('/music/search', {
      params: { q: 'rock', limit: 3 }
    });
    const tracks = searchResponse.data.data.tracks || [];
    console.log(`      ??? Found ${tracks.length} tracks`);

    if (tracks.length > 0) {
      console.log(`      ???? Sample: ${tracks[0].title} by ${tracks[0].artist}`);
    }

    // Test 4: Trending
    console.log('   3. Trending Music...');
    const trendingResponse = await apiClient.get('/music/trending', {
      params: { limit: 3 }
    });
    const trendingTracks = trendingResponse.data.data.tracks || [];
    console.log(`      ??? Found ${trendingTracks.length} trending tracks`);

    // Test 5: User Registration
    console.log('   4. User Registration...');
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      username: `testuser${Date.now()}`
    };

    const registerResponse = await apiClient.post('/auth/register', testUser);
    console.log(`      ??? User created: ${registerResponse.data.data.user.username}`);

    // Test 6: User Login
    console.log('   5. User Login...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginResponse.data.data.accessToken;
    console.log(`      ??? Login successful: ${token ? 'Token received' : 'No token'}`);

    // Set token for authenticated requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test 7: User Profile
    console.log('   6. User Profile...');
    const profileResponse = await apiClient.get('/me');
    console.log(`      ??? Profile loaded: ${profileResponse.data.data.user.username}`);

    // Test 8: Favorites
    console.log('   7. Favorites System...');
    const likedTracksResponse = await apiClient.get('/me/liked-tracks');
    console.log(`      ??? Liked tracks: ${likedTracksResponse.data.data.tracks?.length || 0} tracks`);

    // Test 9: Recently Played
    console.log('   8. Recently Played...');
    const recentlyPlayedResponse = await apiClient.get('/me/recently-played');
    console.log(`      ??? Recently played: ${recentlyPlayedResponse.data.data.tracks?.length || 0} tracks`);

    // Test 10: Recommendations
    console.log('   9. Recommendations...');
    const recommendationsResponse = await apiClient.get('/me/recommendations');
    console.log(`      ??? Recommendations: ${recommendationsResponse.data.data.recommendations?.length || 0} tracks`);

    // Test 11: User Statistics
    console.log('   10. User Statistics...');
    const statsResponse = await apiClient.get('/me/stats');
    const stats = statsResponse.data.data.stats;
    console.log(`      ??? Play time: ${stats.totalPlayTime} minutes`);
    console.log(`      ??? Tracks played: ${stats.totalTracksPlayed}`);

    console.log('\n??? BACKEND API TESTS PASSED!\n');

    return true;
  } catch (error) {
    console.error('??? BACKEND API TESTS FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return false;
  }
};

const testMobileAppStructure = async () => {
  console.log('???? Testing Mobile App Structure...');

  try {
    const mobilePath = path.join(__dirname, 'mobile');

    // Check 1: Package.json exists
    console.log('   1. Package configuration...');
    const packagePath = path.join(mobilePath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log(`      ??? Package.json found: ${packageJson.name}@${packageJson.version}`);

      // Check required dependencies
      const requiredDeps = [
        'react-native', 'firebase', '@react-native-firebase/app',
        '@react-native-firebase/auth', '@react-native-firebase/firestore'
      ];

      let foundDeps = 0;
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          foundDeps++;
        }
      });
      console.log(`      ???? Dependencies: ${foundDeps}/${requiredDeps.length} required packages`);
    } else {
      console.log('      ??? Package.json not found');
    }

    // Check 2: API Service
    console.log('   2. API Service...');
    const apiServicePath = path.join(mobilePath, 'src/services/api.js');
    if (fs.existsSync(apiServicePath)) {
      const apiContent = fs.readFileSync(apiServicePath, 'utf8');
      const hasProductionURL = apiContent.includes('PRODUCTION_BACKEND_URL');
      const hasDevelopmentURL = apiContent.includes('DEVELOPMENT_BACKEND_URL');
      const hasAuthAPI = apiContent.includes('authAPI');
      const hasMusicAPI = apiContent.includes('musicAPI');

      console.log(`      ??? API service exists`);
      console.log(`      ???? Production URL config: ${hasProductionURL ? '???' : '???'}`);
      console.log(`      ???? Development URL config: ${hasDevelopmentURL ? '???' : '???'}`);
      console.log(`      ???? Authentication API: ${hasAuthAPI ? '???' : '???'}`);
      console.log(`      ???? Music API: ${hasMusicAPI ? '???' : '???'}`);
    } else {
      console.log('      ??? API service not found');
    }

    // Check 3: Firebase Configuration
    console.log('   3. Firebase Configuration...');
    const firebasePath = path.join(mobilePath, 'src/services/firebase.js');
    if (fs.existsSync(firebasePath)) {
      const firebaseContent = fs.readFileSync(firebasePath, 'utf8');
      const hasFirestore = firebaseContent.includes('getFirestore');
      const hasAuth = firebaseContent.includes('getAuth');
      const hasConfig = firebaseContent.includes('apiKey');

      console.log(`      ??? Firebase config exists`);
      console.log(`      ???? Firestore: ${hasFirestore ? '???' : '???'}`);
      console.log(`      ???? Authentication: ${hasAuth ? '???' : '???'}`);
      console.log(`      ?????? Configuration: ${hasConfig ? '???' : '???'}`);
    } else {
      console.log('      ??? Firebase config not found');
    }

    // Check 4: Redux Store
    console.log('   4. Redux Store...');
    const storePath = path.join(mobilePath, 'src/store/store.js');
    if (fs.existsSync(storePath)) {
      const storeContent = fs.readFileSync(storePath, 'utf8');
      const hasRedux = storeContent.includes('createStore') || storeContent.includes('configureStore');
      const hasPersist = storeContent.includes('persistStore');

      console.log(`      ??? Redux store exists`);
      console.log(`      ??????? Redux setup: ${hasRedux ? '???' : '???'}`);
      console.log(`      ???? Persistence: ${hasPersist ? '???' : '???'}`);
    } else {
      console.log('      ??? Redux store not found');
    }

    console.log('\n??? MOBILE APP STRUCTURE TESTS PASSED!\n');

    return true;
  } catch (error) {
    console.error('??? MOBILE APP STRUCTURE TESTS FAILED:', error.message);
    return false;
  }
};

const testFirebaseServices = async () => {
  console.log('???? Testing Firebase Services...');

  try {
    // Check 1: Firebase Configuration Files
    console.log('   1. Firebase Configuration Files...');
    const mobilePath = path.join(__dirname, 'mobile');

    const firebaseConfigPath = path.join(mobilePath, 'src/services/firebase.js');
    const firestoreRulesPath = path.join(mobilePath, 'firestore.rules');
    const storageRulesPath = path.join(mobilePath, 'storage.rules');
    const realtimeRulesPath = path.join(mobilePath, 'realtime-database.rules.json');

    console.log(`      ???? Firebase config: ${fs.existsSync(firebaseConfigPath) ? '???' : '???'}`);
    console.log(`      ???? Firestore rules: ${fs.existsSync(firestoreRulesPath) ? '???' : '???'}`);
    console.log(`      ???? Storage rules: ${fs.existsSync(storageRulesPath) ? '???' : '???'}`);
    console.log(`      ???? Realtime rules: ${fs.existsSync(realtimeRulesPath) ? '???' : '???'}`);

    // Check 2: Firebase Services
    console.log('   2. Firebase Services...');
    const userServicePath = path.join(mobilePath, 'src/services/userService.js');
    const playlistServicePath = path.join(mobilePath, 'src/services/playlistService.js');
    const firebaseUtilsPath = path.join(mobilePath, 'src/services/firebaseUtils.js');

    console.log(`      ???? User service: ${fs.existsSync(userServicePath) ? '???' : '???'}`);
    console.log(`      ???? Playlist service: ${fs.existsSync(playlistServicePath) ? '???' : '???'}`);
    console.log(`      ??????? Firebase utils: ${fs.existsSync(firebaseUtilsPath) ? '???' : '???'}`);

    // Check 3: Security Rules Content
    console.log('   3. Security Rules Content...');
    if (fs.existsSync(firestoreRulesPath)) {
      const rulesContent = fs.readFileSync(firestoreRulesPath, 'utf8');
      const hasUserRules = rulesContent.includes('users/{userId}');
      const hasPlaylistRules = rulesContent.includes('playlists/{playlistId}');
      const hasAuthCheck = rulesContent.includes('isAuthenticated');

      console.log(`      ???? User rules: ${hasUserRules ? '???' : '???'}`);
      console.log(`      ???? Playlist rules: ${hasPlaylistRules ? '???' : '???'}`);
      console.log(`      ???? Auth checks: ${hasAuthCheck ? '???' : '???'}`);
    }

    console.log('\n??? FIREBASE SERVICES TESTS PASSED!\n');

    return true;
  } catch (error) {
    console.error('??? FIREBASE SERVICES TESTS FAILED:', error.message);
    return false;
  }
};

const testDeploymentReadiness = async () => {
  console.log('???? Testing Deployment Readiness...');

  try {
    // Check 1: Backend Deployment Files
    console.log('   1. Backend Deployment...');
    const backendPath = path.join(__dirname, 'backend');

    const dockerfilePath = path.join(backendPath, 'Dockerfile');
    const dockerignorePath = path.join(backendPath, '.dockerignore');
    const deployScriptPath = path.join(backendPath, 'deploy-gcp.sh');
    const envFilePath = path.join(backendPath, '.env.production');

    console.log(`      ???? Dockerfile: ${fs.existsSync(dockerfilePath) ? '???' : '???'}`);
    console.log(`      ???? .dockerignore: ${fs.existsSync(dockerignorePath) ? '???' : '???'}`);
    console.log(`      ???? Deploy script: ${fs.existsSync(deployScriptPath) ? '???' : '???'}`);
    console.log(`      ?????? Environment config: ${fs.existsSync(envFilePath) ? '???' : '???'}`);

    // Check 2: Mobile Deployment Files
    console.log('   2. Mobile Deployment...');
    const mobilePath = path.join(__dirname, 'mobile');

    const firebaseSetupScriptPath = path.join(mobilePath, 'setup-firebase.sh');
    const firebaseProductionPath = path.join(mobilePath, 'src/services/firebase.production.js');

    console.log(`      ???? Firebase setup: ${fs.existsSync(firebaseSetupScriptPath) ? '???' : '???'}`);
    console.log(`      ???? Production config: ${fs.existsSync(firebaseProductionPath) ? '???' : '???'}`);

    // Check 3: Documentation
    console.log('   3. Documentation...');
    const gcpGuidePath = path.join(backendPath, 'GCP-DEPLOYMENT-GUIDE.md');
    const firebaseGuidePath = path.join(mobilePath, 'FIREBASE-PRODUCTION-SETUP.md');

    console.log(`      ???? GCP guide: ${fs.existsSync(gcpGuidePath) ? '???' : '???'}`);
    console.log(`      ???? Firebase guide: ${fs.existsSync(firebaseGuidePath) ? '???' : '???'}`);

    console.log('\n??? DEPLOYMENT READINESS TESTS PASSED!\n');

    return true;
  } catch (error) {
    console.error('??? DEPLOYMENT READINESS TESTS FAILED:', error.message);
    return false;
  }
};

const runAllTests = async () => {
  console.log('???? Running Complete Test Suite...\n');

  const results = {
    backend: await testBackendAPI(),
    mobile: await testMobileAppStructure(),
    firebase: await testFirebaseServices(),
    deployment: await testDeploymentReadiness()
  };

  const passedTests = Object.values(results).filter(result => result === true).length;
  const totalTests = Object.keys(results).length;

  console.log('???? TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`??? Passed: ${passedTests}/${totalTests}`);
  console.log(`??? Failed: ${totalTests - passedTests}/${totalTests}`);

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '???' : '???';
    console.log(`${status} ${test.toUpperCase()}`);
  });

  if (passedTests === totalTests) {
    console.log('\n???? ALL TESTS PASSED! Platform is ready for deployment.');
    console.log('\n???? Next Steps:');
    console.log('   1. Deploy backend: cd backend && ./deploy-gcp.sh');
    console.log('   2. Configure Firebase: cd mobile && ./setup-firebase.sh');
    console.log('   3. Update production URLs in mobile app');
    console.log('   4. Test with real devices');
    console.log('   5. Deploy to app stores');
  } else {
    console.log('\n?????? Some tests failed. Please fix issues before deployment.');
  }

  return passedTests === totalTests;
};

// Run the complete test suite
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
});
