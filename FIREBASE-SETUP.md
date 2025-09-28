# Firebase Setup Guide

This guide will help you set up Firebase for the COMBO backend.

## Prerequisites

1. Node.js 16+ installed
2. npm or yarn installed
3. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
4. Service account key downloaded from Firebase Console

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Firebase Service Account

Run the setup script to configure your Firebase service account:

```bash
npm run setup:firebase
```

Follow the interactive prompts to enter your Firebase service account details. The script will:

1. Create a `config` directory if it doesn't exist
2. Store the service account in `config/firebase-service-account.json`
3. Set secure file permissions (600)

### 3. Verify Firebase Connection

Test the Firebase connection:

```bash
npm run verify:firebase
```

This will test:
- Firestore connection
- Authentication service
- Realtime Database (if configured)

## Environment Variables

For production, you can set these environment variables:

- `FIREBASE_DATABASE_URL`: Your Firebase Realtime Database URL (default: `https://combo-624e1-default-rtdb.firebaseio.com`)
- `NODE_ENV`: Set to `production` for production mode

## Security Notes

- The service account file is stored locally with 600 permissions (read/write for owner only)
- The `config` directory is included in `.gitignore` to prevent accidental commits
- Never commit the service account key to version control
- In production, consider using environment variables or a secure secret manager

## Troubleshooting

### Service account not found

If you see an error about the service account not being found:

1. Make sure you've run `npm run setup:firebase`
2. Verify the file exists at `config/firebase-service-account.json`
3. Check file permissions: `ls -l config/firebase-service-account.json`

### Permission denied errors

If you see permission errors:

```bash
chmod 600 config/firebase-service-account.json
```

### Regenerating Service Account Key

If you need to regenerate your service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Run `npm run setup:firebase` again with the new key

## Support

For additional help, please contact the development team.
