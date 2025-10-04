require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get current date for backup filename
const now = new Date();
const dateStr = now.toISOString().replace(/[:.]/g, '-');
const backupFilename = `backup-${dateStr}.json`;
const backupPath = path.join(backupDir, backupFilename);

// Collections to back up
const collections = ['users', 'tracks', 'playlists', 'genres'];

// Backup data from Firestore
const backupFirestore = async () => {
  console.log('📦 Starting Firestore backup...');
  const backupData = {};

  for (const collection of collections) {
    try {
      console.log(`🔍 Backing up collection: ${collection}`);
      const snapshot = await db.collection(collection).get();
      backupData[collection] = [];

      snapshot.forEach((doc) => {
        backupData[collection].push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Backed up ${backupData[collection].length} documents from ${collection}`);
    } catch (error) {
      console.error(`❌ Error backing up collection ${collection}:`, error);
      throw error;
    }
  }

  // Write backup to file
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`💾 Firestore backup saved to ${backupPath}`);

  return backupPath;
};

// Upload backup to Google Cloud Storage
const uploadBackup = async (filePath) => {
  if (!process.env.BACKUP_BUCKET) {
    console.log('ℹ️ No backup bucket specified, skipping upload');
    return;
  }

  try {
    console.log('☁️ Uploading backup to Google Cloud Storage...');
    const destination = `backups/${path.basename(filePath)}`;
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'application/json',
        metadata: {
          created: new Date().toISOString(),
          description: 'Firestore backup',
        },
      },
    });

    console.log(`✅ Backup uploaded to gs://${process.env.BACKUP_BUCKET}/${destination}`);
  } catch (error) {
    console.error('❌ Error uploading backup to Google Cloud Storage:', error);
    throw error;
  }
};

// Clean up old backups
const cleanupOldBackups = (maxBackups = 30) => {
  try {
    console.log('🧹 Cleaning up old backups...');
    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith('.json') && file.startsWith('backup-'))
      .map((file) => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only the most recent maxBackups
    const toDelete = files.slice(maxBackups);

    toDelete.forEach((file) => {
      console.log(`🗑️ Deleting old backup: ${file.name}`);
      fs.unlinkSync(file.path);
    });

    console.log(`✅ Cleaned up ${toDelete.length} old backups`);
  } catch (error) {
    console.error('❌ Error cleaning up old backups:', error);
    throw error;
  }
};

// Main function
const runBackup = async () => {
  try {
    console.log('🚀 Starting database backup...');

    // Backup Firestore
    const backupPath = await backupFirestore();

    // Upload to Google Cloud Storage if configured
    if (process.env.BACKUP_BUCKET) {
      await uploadBackup(backupPath);
    }

    // Clean up old backups
    cleanupOldBackups(parseInt(process.env.MAX_BACKUPS || '30'));

    console.log('🎉 Backup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
};

// Run the backup
runBackup();
