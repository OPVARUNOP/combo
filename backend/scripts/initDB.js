const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Track = require('../src/models/Track');
const Playlist = require('../src/models/Playlist');
require('dotenv').config();

const initDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany({});
    await Track.deleteMany({});
    await Playlist.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: hashedPassword,
      role: 'user',
    });

    const artist1 = await User.create({
      username: 'artist1',
      email: 'artist1@example.com',
      password: hashedPassword,
      role: 'artist',
    });

    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Created sample users');

    // Create sample tracks
    const track1 = await Track.create({
      title: 'Summer Vibes',
      artist: artist1._id,
      duration: 180,
      genre: ['Pop', 'Electronic'],
      audioUrl: 'https://example.com/audio1.mp3',
      coverImage: 'https://via.placeholder.com/300',
      isExplicit: false,
    });

    const track2 = await Track.create({
      title: 'Midnight Dreams',
      artist: artist1._id,
      duration: 210,
      genre: ['R&B', 'Soul'],
      audioUrl: 'https://example.com/audio2.mp3',
      coverImage: 'https://via.placeholder.com/300',
      isExplicit: true,
    });

    console.log('Created sample tracks');

    // Create sample playlists
    await Playlist.create({
      name: 'My Favorites',
      description: 'My favorite tracks',
      owner: user1._id,
      tracks: [track1._id, track2._id],
      isPublic: true,
    });

    await Playlist.create({
      name: 'Workout Mix',
      description: 'High energy tracks for workouts',
      owner: user1._id,
      tracks: [track1._id],
      isPublic: false,
    });

    console.log('Created sample playlists');

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();
