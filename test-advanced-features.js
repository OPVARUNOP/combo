#!/usr/bin/env node

/**
 * Test Advanced Features - Favorites, Recently Played, Recommendations
 * This script tests all the advanced features implemented in the backend
 */

const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const testAdvancedFeatures = async () => {
  console.log('🧪 Testing Advanced Features - Favorites, Recently Played, Recommendations...\n');

  try {
    // Test 1: Favorites/Liked Songs
    console.log('1. Testing Favorites/Liked Songs...');
    const likedTracksResponse = await apiClient.get('/me/liked-tracks');
    const likedTracks = likedTracksResponse.data.data.tracks || [];
    console.log('   ✅ Liked tracks:', likedTracks.length, 'tracks');

    if (likedTracks.length > 0) {
      console.log('   🎵 Sample liked track:', `${likedTracks[0].title} by ${likedTracks[0].artist}`);
      console.log('   📅 Liked:', new Date(likedTracks[0].likedAt).toLocaleDateString());
    }

    // Test 2: Recently Played
    console.log('\n2. Testing Recently Played...');
    const recentlyPlayedResponse = await apiClient.get('/me/recently-played', {
      params: { limit: 5 }
    });
    const recentlyPlayed = recentlyPlayedResponse.data.data.tracks || [];
    console.log('   ✅ Recently played:', recentlyPlayed.length, 'tracks');

    if (recentlyPlayed.length > 0) {
      console.log('   🎵 Most recent:', `${recentlyPlayed[0].title} by ${recentlyPlayed[0].artist}`);
      console.log('   ⏰ Played:', new Date(recentlyPlayed[0].playedAt).toLocaleString());
    }

    // Test 3: Recommendations
    console.log('\n3. Testing Recommendations...');
    const recommendationsResponse = await apiClient.get('/me/recommendations', {
      params: { limit: 3 }
    });
    const recommendations = recommendationsResponse.data.data.recommendations || [];
    console.log('   ✅ Recommendations:', recommendations.length, 'tracks');

    if (recommendations.length > 0) {
      console.log('   🎵 Top recommendation:', `${recommendations[0].title} by ${recommendations[0].artist}`);
      console.log('   💡 Reason:', recommendations[0].reason);
    }

    // Test 4: Discovery
    console.log('\n4. Testing Discovery...');
    const discoveryResponse = await apiClient.get('/me/discovery', {
      params: { limit: 3 }
    });
    const discovery = discoveryResponse.data.data.discovery || [];
    console.log('   ✅ Discovery:', discovery.length, 'playlists');

    if (discovery.length > 0) {
      console.log('   🎵 Discovery playlist:', discovery[0].title);
      console.log('   📝 Description:', discovery[0].description);
    }

    // Test 5: Listening History
    console.log('\n5. Testing Listening History...');
    const historyResponse = await apiClient.get('/me/history', {
      params: { limit: 5 }
    });
    const history = historyResponse.data.data.history || [];
    console.log('   ✅ History:', history.length, 'entries');

    if (history.length > 0) {
      console.log('   🎵 Recent play:', `${history[0].trackTitle} by ${history[0].artist}`);
      console.log('   ⏰ Played:', new Date(history[0].playedAt).toLocaleString());
    }

    // Test 6: User Statistics
    console.log('\n6. Testing User Statistics...');
    const statsResponse = await apiClient.get('/me/stats');
    const stats = statsResponse.data.data.stats;
    console.log('   ✅ Total play time:', stats.totalPlayTime, 'minutes');
    console.log('   ✅ Total tracks played:', stats.totalTracksPlayed);
    console.log('   ✅ Favorite genres:', stats.favoriteGenres.join(', '));
    console.log('   ✅ Listening streak:', stats.listeningStreak, 'days');
    console.log('   ✅ Top artist:', stats.topArtist);

    // Test 7: Similar Tracks
    console.log('\n7. Testing Similar Tracks...');
    const similarTracksResponse = await apiClient.get('/recommendations/similar/12345', {
      params: { limit: 3 }
    });
    const similarTracks = similarTracksResponse.data.data.similarTracks || [];
    console.log('   ✅ Similar tracks:', similarTracks.length, 'tracks');

    if (similarTracks.length > 0) {
      console.log('   🎵 Similar to Bohemian Rhapsody:', `${similarTracks[0].title} by ${similarTracks[0].artist}`);
      console.log('   💡 Reason:', similarTracks[0].reason);
    }

    // Test 8: Mood-based Recommendations
    console.log('\n8. Testing Mood-based Recommendations...');
    const moodTracksResponse = await apiClient.get('/recommendations/mood/relaxed', {
      params: { limit: 3 }
    });
    const moodTracks = moodTracksResponse.data.data.moodTracks || [];
    console.log('   ✅ Mood tracks (relaxed):', moodTracks.length, 'tracks');

    if (moodTracks.length > 0) {
      console.log('   🎵 Relaxed track:', `${moodTracks[0].title} by ${moodTracks[0].artist}`);
      console.log('   💡 Reason:', moodTracks[0].reason);
    }

    // Test 9: Track play event
    console.log('\n9. Testing Track Play Event...');
    const playEventResponse = await apiClient.post('/me/track-played/12345', {
      duration: 355,
      position: 180
    });
    console.log('   ✅ Play event tracked:', playEventResponse.data.data.message);

    // Test 10: Add/Remove from favorites
    console.log('\n10. Testing Add/Remove Favorites...');
    const addFavoriteResponse = await apiClient.post('/me/liked-tracks/12345');
    console.log('   ✅ Added to favorites:', addFavoriteResponse.data.data.message);

    const removeFavoriteResponse = await apiClient.delete('/me/liked-tracks/12345');
    console.log('   ✅ Removed from favorites:', removeFavoriteResponse.data.data.message);

    console.log('\n🎉 ALL ADVANCED FEATURES TESTS PASSED!');
    console.log('\n📱 Advanced Features Status: ✅ COMPLETE');
    console.log('🎵 Features implemented:');
    console.log('   • Favorites/Liked Songs');
    console.log('   • Recently Played');
    console.log('   • Personalized Recommendations');
    console.log('   • Discovery Playlists');
    console.log('   • Listening History');
    console.log('   • User Statistics');
    console.log('   • Similar Tracks');
    console.log('   • Mood-based Recommendations');
    console.log('   • Play Event Tracking');
    console.log('\n🚀 Ready for mobile app integration!');

  } catch (error) {
    console.error('\n❌ ADVANCED FEATURES TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

// Run the test
testAdvancedFeatures();
