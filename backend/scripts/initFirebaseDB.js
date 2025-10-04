const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-service-account.json');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

const initDB = async () => {
  try {
    // Clear existing data (be careful with this in production!)
    console.log('Clearing existing data...');

    // Delete all users (except the default admin user)
    const usersSnapshot = await db.collection('users').get();
    const userBatch = db.batch();
    usersSnapshot.docs.forEach((doc) => {
      if (doc.id !== 'admin') {
        // Don't delete the admin user
        userBatch.delete(doc.ref);
      }
    });
    await userBatch.commit();

    // Delete all tracks
    const tracksSnapshot = await db.collection('tracks').get();
    const trackBatch = db.batch();
    tracksSnapshot.docs.forEach((doc) => {
      trackBatch.delete(doc.ref);
    });
    await trackBatch.commit();

    // Delete all playlists
    const playlistsSnapshot = await db.collection('playlists').get();
    const playlistBatch = db.batch();
    playlistsSnapshot.docs.forEach((doc) => {
      playlistBatch.delete(doc.ref);
    });
    await playlistBatch.commit();

    console.log('Cleared existing data');

    // Create sample users
    console.log('Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create regular user
    const user1 = {
      id: uuidv4(),
      username: 'user1',
      email: 'user1@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://via.placeholder.com/150',
      favorites: [],
      playlists: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create artist user
    const artist1 = {
      id: uuidv4(),
      username: 'artist1',
      email: 'artist1@example.com',
      password: hashedPassword,
      role: 'artist',
      avatar: 'https://via.placeholder.com/150',
      favorites: [],
      playlists: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create admin user
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://via.placeholder.com/150',
      favorites: [],
      playlists: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save users to Firestore
    await db.collection('users').doc(user1.id).set(user1);
    await db.collection('users').doc(artist1.id).set(artist1);
    await db.collection('users').doc(adminUser.id).set(adminUser);

    console.log('Created sample users');

    // Create sample tracks
    console.log('Creating sample tracks...');

    const track1 = {
      id: uuidv4(),
      title: 'Summer Vibes',
      artist: artist1.id,
      duration: 180,
      genre: ['Pop', 'Electronic'],
      audioUrl: 'https://example.com/audio1.mp3',
      coverImage: 'https://via.placeholder.com/300',
      plays: 0,
      likes: [],
      isExplicit: false,
      releaseDate: admin.firestore.Timestamp.fromDate(new Date('2023-06-01')),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const track2 = {
      id: uuidv4(),
      title: 'Midnight Dreams',
      artist: artist1.id,
      duration: 210,
      genre: ['R&B', 'Soul'],
      audioUrl: 'https://example.com/audio2.mp3',
      coverImage: 'https://via.placeholder.com/300',
      plays: 0,
      likes: [],
      isExplicit: true,
      releaseDate: admin.firestore.Timestamp.fromDate(new Date('2023-07-15')),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save tracks to Firestore
    await db.collection('tracks').doc(track1.id).set(track1);
    await db.collection('tracks').doc(track2.id).set(track2);

    console.log('Created sample tracks');

    // Create sample playlists
    console.log('Creating sample playlists...');

    const playlist1 = {
      id: uuidv4(),
      name: 'My Favorites',
      description: 'My favorite tracks',
      owner: user1.id,
      tracks: [track1.id, track2.id],
      isPublic: true,
      coverImage: 'https://via.placeholder.com/300',
      followers: [user1.id],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const playlist2 = {
      id: uuidv4(),
      name: 'Workout Mix',
      description: 'High energy tracks for workouts',
      owner: user1.id,
      tracks: [track1.id],
      isPublic: false,
      coverImage: 'https://via.placeholder.com/300',
      followers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save playlists to Firestore
    await db.collection('playlists').doc(playlist1.id).set(playlist1);
    await db.collection('playlists').doc(playlist2.id).set(playlist2);

    // Update user with playlists
    await db
      .collection('users')
      .doc(user1.id)
      .update({
        playlists: [playlist1.id, playlist2.id],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('Created sample playlists');

    console.log('Database initialized successfully!');
    console.log('\nSample users:');
    console.log(`- User: ${user1.email} / password123`);
    console.log(`- Artist: ${artist1.email} / password123`);
    console.log(`- Admin: ${adminUser.email} / password123`);

    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();
