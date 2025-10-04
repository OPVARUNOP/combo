const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../backups/firestore');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
const backupFile = path.join(backupDir, `firestore-backup-${timestamp}.json`);

console.log(`🚀 Starting Firestore backup to: ${backupFile}`);

try {
  // Export Firestore data
  execSync(`gcloud firestore export --project=${process.env.FIREBASE_PROJECT_ID} ${backupFile}`, {
    stdio: 'inherit',
  });

  console.log(`\n✅ Firestore backup completed successfully!`);
  console.log(`   Backup saved to: ${backupFile}`);

  // Keep only the last 7 backups
  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith('firestore-backup-') && file.endsWith('.json'))
    .sort()
    .reverse()
    .slice(7);

  for (const file of files) {
    fs.unlinkSync(path.join(backupDir, file));
    console.log(`   Removed old backup: ${file}`);
  }
} catch (error) {
  console.error('\n❌ Firestore backup failed:', error.message);
  process.exit(1);
}
