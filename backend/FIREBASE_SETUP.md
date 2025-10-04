# Firebase Backend Setup Guide

## Prerequisites

1. Node.js (v14 or later)
2. npm or yarn
3. Firebase account (https://firebase.google.com/)
4. Firebase CLI (install with `npm install -g firebase-tools`)

## Setup Instructions

### 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. After creating the project, go to Project Settings (gear icon)
4. Under "Your apps", click on the `</>` icon to add a web app
5. Register the app and note down the Firebase configuration

### 2. Service Account Setup

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the `backend` directory

### 3. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your Firebase configuration:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Firebase Configuration
   FIREBASE_DATABASE_URL=your_database_url
   FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # File Upload Configuration
   MAX_FILE_UPLOAD=10000000 # 10MB
   FILE_UPLOAD_PATH=./public/uploads
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Initialize Firebase Database

Run the initialization script to set up the database with sample data:

```bash
npm run init:firebase
```

This will:
- Clear any existing data (except admin users)
- Create sample users (regular user, artist, admin)
- Add sample tracks
- Create sample playlists

### 6. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run init:firebase` - Initialize Firebase with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`
- API Spec: `http://localhost:5000/api-docs.json`

## Troubleshooting

1. **Firebase Authentication Errors**
   - Make sure your service account file is correctly placed at `backend/firebase-service-account.json`
   - Verify that the service account has the necessary permissions in Firebase Console

2. **CORS Issues**
   - Ensure the `CORS_ORIGIN` in `.env` matches your frontend URL
   - Restart the server after changing environment variables

3. **Database Connection Issues**
   - Verify your `FIREBASE_DATABASE_URL` is correct in `.env`
   - Check your internet connection
   - Make sure your Firebase project has Firestore Database enabled

## Deployment

To deploy your backend to Firebase:

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Security Notes

- Never commit `firebase-service-account.json` or `.env` to version control
- Use strong, unique values for `JWT_SECRET` in production
- Set appropriate security rules in Firebase Console
- Regularly backup your Firestore database
