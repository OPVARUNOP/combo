/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Music, Playlist } = require('../models');
const config = require('../config/config');

const seedUsers = async () => {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true,
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      isEmailVerified: true,
    },
    {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      isEmailVerified: true,
    },
  ];

  // Hash passwords
  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  await User.deleteMany({});
  await User.insertMany(users);
  console.log('Users seeded successfully');
};

const seedMusic = async () => {
  const sampleMusic = [
    {
      source: 'youtube',
      sourceId: 'dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      description: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: 213,
      channelTitle: 'Rick Astley',
      channelId: 'UCuAXFkgsw1Js7-5e3H5HzJQ',
      viewCount: 1200000000,
      likeCount: 12000000,
      category: '10',
      tags: ['pop', '80s', 'rick astley', 'never gonna give you up'],
    },
    {
      source: 'youtube',
      sourceId: 'JGwWNGJdvx8',
      title: 'Shape of You',
      description: 'Ed Sheeran - Shape of You (Official Music Video)',
      thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      duration: 234,
      channelTitle: 'Ed Sheeran',
      channelId: 'UC0C-w0YjGpqDXGB8IHb7Ayg',
      viewCount: 5900000000,
      likeCount: 37000000,
      category: '10',
      tags: ['pop', 'ed sheeran', 'shape of you', 'music video'],
    },
  ];

  await Music.deleteMany({});
  await Music.insertMany(sampleMusic);
  console.log('Music seeded successfully');
};

const seedPlaylists = async () => {
  // Get users
  const admin = await User.findOne({ email: 'admin@example.com' });
  const john = await User.findOne({ email: 'john@example.com' });

  // Get music
  const music = await Music.find({});

  const playlists = [
    {
      name: 'My Favorites',
      description: 'My favorite tracks',
      user: admin._id,
      tracks: music.map((m) => m._id),
      isPublic: true,
      coverImage: 'https://i.scdn.co/image/ab67706c0000bebbc9b9e8b7e8d8b7e8d8b7e8d8',
    },
    {
      name: 'Workout Mix',
      description: 'High energy tracks for working out',
      user: john._id,
      tracks: [music[0]._id],
      isPublic: false,
      coverImage: 'https://i.scdn.co/image/ab67706c0000bebbc9b9e8b7e8d8b7e8d8b7e8d9',
    },
  ];

  await Playlist.deleteMany({});
  await Playlist.insertMany(playlists);
  console.log('Playlists seeded successfully');
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    await seedUsers();
    await seedMusic();
    await seedPlaylists();

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
