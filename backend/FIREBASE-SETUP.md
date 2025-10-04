# Firebase Backend Setup Guide

This guide will help you set up and configure the Firebase backend for the COMBO application.

## Prerequisites

1. Node.js (v14 or later)
2. Firebase CLI (`npm install -g firebase-tools`)
3. A Firebase project with Firestore and Authentication enabled
4. Service account key JSON file (download from Firebase Console > Project Settings > Service Accounts)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Firebase
FIREBASE_DATABASE_URL=your-firebase-database-url
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_ACCESS_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=30

# Backblaze B2 (if using)
B2_KEY_ID=your-b2-key-id
B2_APPLICATION_KEY=your-b2-application-key
B2_BUCKET_ID=your-b2-bucket-id
B2_BUCKET_NAME=your-b2-bucket-name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Firebase

1. Log in to Firebase CLI:
   ```bash
   firebase login
   ```

2. Initialize Firebase project:
   ```bash
   firebase init
   ```
   Select:
   - Firestore: Configure security rules and indexes
   - Storage: Configure security rules
   - Hosting: Not needed for backend

### 4. Set Up Firestore

Run the setup script to create indexes and security rules:

```bash
npm run setup:firebase
```

### 5. Migrate Data (If Applicable)

If you're migrating from MongoDB, run:

```bash
npm run migrate:firebase
```

### 6. Start the Server

```bash
npm start
# or for development
npm run dev
```

## Security Rules

The following security rules are applied:

1. **Authentication Required**: All write operations require authentication
2. **Email Verification**: Write operations require verified email
3. **User-Specific Access**: Users can only modify their own data
4. **Public Read Access**: Some resources (like public playlists) are readable by all authenticated users

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete current user account

### Music

- `GET /api/music` - Get all music
- `GET /api/music/search` - Search music
- `GET /api/music/:id` - Get music by ID

### Playlists

- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists/:id` - Get playlist by ID
- `PATCH /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

## Error Handling

The API returns standard HTTP status codes with JSON error responses:

```json
{
  "status": "error",
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Monitoring

1. **Firebase Console**: Monitor usage, errors, and performance
2. **Logs**: Check server logs for debugging
3. **Error Tracking**: Set up error tracking with Firebase Crashlytics

## Deployment

### Firebase Functions

For production, consider deploying the backend as Firebase Functions:

1. Install dependencies:
   ```bash
   npm install firebase-functions
   ```

2. Deploy:
   ```bash
   firebase deploy --only functions
   ```

### Environment Configuration

For production, set environment variables in:
- Firebase Console > Project Settings > Service Accounts
- Firebase Console > Functions > Environment Variables

## Troubleshooting

1. **Authentication Errors**:
   - Verify service account key permissions
   - Check Firebase Authentication rules

2. **Firestore Permission Denied**:
   - Verify security rules
   - Check user authentication status

3. **Storage Access Issues**:
   - Verify storage rules
   - Check file permissions

## Support

For issues, please open a GitHub issue or contact the development team.
