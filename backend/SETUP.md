# COMBO Backend Setup Guide

This guide will help you set up the COMBO backend with Firestore.

## Prerequisites

- Node.js 16+ and npm 8+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (for backups)
- A Firebase project with Firestore enabled

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/combo-backend.git
   cd combo-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your Firebase project details
   - Place your Firebase service account JSON file at `config/firebase-service-account.json`

4. **Initialize Firebase**
   ```bash
   firebase login
   firebase use your-project-id
   ```

5. **Deploy Firestore rules**
   ```bash
   npm run deploy:rules
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests
- `npm run deploy` - Deploy to production
- `npm run deploy:rules` - Deploy Firestore security rules
- `npm run backup` - Create a backup of Firestore data

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL
- `FIREBASE_STORAGE_BUCKET` - Firebase Storage bucket
- `JWT_SECRET` - Secret for JWT token signing
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## Backup and Restore

### Create Backup
```bash
npm run backup
```

### Restore from Backup
```bash
gcloud firestore import gs://your-bucket/backup-folder/
```

## Monitoring

- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/

## Troubleshooting

- **Firebase Authentication Issues**: Ensure your service account has the correct permissions
- **Firestore Permission Denied**: Check your security rules and authentication
- **Connection Issues**: Verify your Firebase project ID and service account

## Support

For support, please contact [your-email@example.com](mailto:your-email@example.com)
