const database = require('../src/services/database.service');

async function runDemo() {
  try {
    console.log('🚀 Starting Database Service Demo');

    // 1. Set some data
    console.log('\n1. Setting user data...');
    const userId = 'user_' + Date.now();
    const userData = {
      name: 'Test User',
      email: `test.${Date.now()}@example.com`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    await database.set(`users/${userId}`, userData);
    console.log('✅ User created:', { userId, ...userData });

    // 2. Get the user data
    console.log('\n2. Getting user data...');
    const user = await database.get(`users/${userId}`);
    console.log('✅ Retrieved user:', user);

    // 3. Update user data
    console.log('\n3. Updating user status...');
    await database.update(`users/${userId}`, { status: 'verified' });
    console.log('✅ User status updated to "verified"');

    // 4. Add items to a list (playlist)
    console.log('\n4. Creating a playlist...');
    const playlistId = `playlist_${Date.now()}`;
    const songs = [
      { title: 'Song 1', artist: 'Artist 1', duration: 180 },
      { title: 'Song 2', artist: 'Artist 2', duration: 210 },
      { title: 'Song 3', artist: 'Artist 1', duration: 195 },
    ];

    await database.set(`playlists/${playlistId}`, {
      name: 'My Playlist',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      songCount: songs.length,
    });

    // Add songs to the playlist
    for (const song of songs) {
      await database.push(`playlists/${playlistId}/songs`, song);
    }

    console.log(`✅ Created playlist with ${songs.length} songs`);

    // 5. Query data
    console.log('\n5. Querying data...');

    // Get all playlists
    const playlists = await database.list('playlists');
    console.log('📋 All playlists:', playlists);

    // Get songs from the first playlist
    if (playlists.length > 0) {
      const playlistSongs = await database.list(`playlists/${playlists[0].id}/songs`);
      console.log(`🎵 Songs in playlist "${playlists[0].name}":`, playlistSongs);
    }

    // 6. Clean up (comment these lines if you want to keep the test data)
    console.log('\n6. Cleaning up test data...');
    await database.remove(`users/${userId}`);
    await database.remove(`playlists/${playlistId}`);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Database Service Demo Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
runDemo();
