require('dotenv').config();
const admin = require('firebase-admin');

const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// Sample data
const users = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true,
    status: 'active',
  },
  {
    id: 'user-1',
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    role: 'user',
    isEmailVerified: true,
    status: 'active',
  },
];

const genres = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Rap',
  'R&B',
  'Electronic',
  'Dance',
  'Jazz',
  'Classical',
  'Country',
  'Blues',
  'Reggae',
  'Metal',
  'Punk',
  'Folk',
  'Indie',
  'Alternative',
  'K-Pop',
  'J-Pop',
  'Latin',
  'World',
];

// Hash passwords
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return {
        ...user,
        password: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    })
  );
};

// Seed users
const seedUsers = async () => {
  try {
    const hashedUsers = await hashPasswords(users);
    const batch = db.batch();

    for (const user of hashedUsers) {
      const userRef = db.collection('users').doc(user.id);
      batch.set(userRef, user);
    }

    await batch.commit();
    console.log('✅ Users seeded successfully');
    return hashedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed genres
const seedGenres = async () => {
  try {
    const batch = db.batch();
    const genresRef = db.collection('genres');

    for (const name of genres) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const genreRef = genresRef.doc(id);
      batch.set(genreRef, {
        id,
        name,
        slug: id,
        description: `${name} music`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log('✅ Genres seeded successfully');
  } catch (error) {
    console.error('Error seeding genres:', error);
    throw error;
  }
};

// Main function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed users
    await seedUsers();

    // Seed genres
    await seedGenres();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
