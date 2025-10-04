const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

const envContent = `# Backblaze B2 Configuration
B2_APPLICATION_KEY_ID=${process.env.B2_APPLICATION_KEY_ID || 'your_b2_key_id'}
B2_APPLICATION_KEY=${process.env.B2_APPLICATION_KEY || 'your_b2_application_key'}
B2_BUCKET_NAME=${process.env.B2_BUCKET_NAME || 'your_b2_bucket_name'}
B2_BUCKET_ID=${process.env.B2_BUCKET_ID || 'your_b2_bucket_id'}
B2_DOWNLOAD_URL=${process.env.B2_DOWNLOAD_URL || 'your_b2_download_url'}

# Server Configuration
PORT=${process.env.PORT || '8080'}
NODE_ENV=${process.env.NODE_ENV || 'development'}

# Firebase Configuration
FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID || 'your-project-id'}
FIREBASE_PRIVATE_KEY_ID=${process.env.FIREBASE_PRIVATE_KEY_ID || 'your_private_key_id'}
FIREBASE_PRIVATE_KEY='${(process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----').replace(/\n/g, '\\n')}'
FIREBASE_CLIENT_EMAIL=${process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com'}
FIREBASE_DATABASE_URL=${process.env.FIREBASE_DATABASE_URL || 'https://your-project-id.firebaseio.com'}
FIREBASE_STORAGE_BUCKET=${process.env.FIREBASE_STORAGE_BUCKET || 'your-project-id.appspot.com'}

# JWT Configuration
JWT_SECRET=${process.env.JWT_SECRET || 'your_jwt_secret_key'}
JWT_ACCESS_EXPIRATION_MINUTES=${process.env.JWT_ACCESS_EXPIRATION_MINUTES || '1440'} # 24 hours
JWT_REFRESH_EXPIRATION_DAYS=${process.env.JWT_REFRESH_EXPIRATION_DAYS || '30'}

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=${process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080'}

# Application Settings
MAX_FILE_SIZE=${process.env.MAX_FILE_SIZE || '10485760'}  # 10MB
`;

// Write to .env file
fs.writeFileSync(envPath, envContent);
console.log('Updated .env file with current environment variables');
