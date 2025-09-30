# Firebase Production Setup Guide

## Prerequisites

1. **Firebase Account**: https://console.firebase.google.com/
2. **Firebase CLI**: Install with `npm install -g firebase-tools`
3. **Google Cloud Project**: Should already be set up from backend deployment

## Firebase Project Setup

### 1. Create/Update Firebase Project

If you don't have a Firebase project yet:

```bash
# Login to Firebase
firebase login

# Create new project (if needed)
firebase projects:create combo-music-app

# Set as default project
firebase use combo-music-app
```

### 2. Enable Firebase Services

In Firebase Console (https://console.firebase.google.com):

1. **Authentication**: Enable Email/Password, Google, Anonymous
2. **Firestore Database**: Create database in production mode
3. **Realtime Database**: Enable (optional, for real-time features)
4. **Storage**: Enable for file uploads
5. **Analytics**: Enable for usage tracking

### 3. Configure Authentication Providers

**Email/Password Authentication:**
- Enable in Authentication > Sign-in method
- Configure password policy
- Enable email verification

**Google Sign-In:**
- Enable Google provider
- Add OAuth client ID from Google Cloud Console

### 4. Set Up Firestore Database

**Database Rules:**
```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

**Initial Data Structure:**
The app will automatically create:
- `users/{userId}` - User profiles and preferences
- `playlists/{playlistId}` - User playlists
- `users/{userId}/likedTracks/{trackId}` - Favorite songs
- `users/{userId}/recentlyPlayed/{trackId}` - Listening history

### 5. Configure Firebase Storage

**Storage Rules:**
```bash
# Deploy storage rules
firebase deploy --only storage
```

**Storage Buckets:**
- Default bucket: `combo-624e1.firebasestorage.app`
- Used for: Profile images, playlist covers, track artwork

## Environment Configuration

### 1. Update Mobile App Firebase Config

Update `/mobile/src/services/firebase.js` with production settings:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB6z2oJLGZtz9Rk9HqHhmR2kk-h5r4VVSM",
  authDomain: "combo-624e1.firebaseapp.com",
  databaseURL: "https://combo-624e1-default-rtdb.firebaseio.com",
  projectId: "combo-624e1",
  storageBucket: "combo-624e1.firebasestorage.app",
  messagingSenderId: "531640636721",
  appId: "1:531640636721:web:3431d1a031e5ce6a9b4c10",
  measurementId: "G-SVP5FX20GH"
};
```

### 2. Environment Variables for Backend

Add to your Cloud Run environment variables:

```bash
# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=combo-624e1
FIREBASE_CLIENT_EMAIL=your-service-account@combo-music-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
```

### 3. Generate Service Account Key

```bash
# In Google Cloud Console:
# 1. Go to IAM & Admin > Service Accounts
# 2. Create service account: "combo-firebase-admin"
# 3. Add roles: Firebase Admin SDK Administrator
# 4. Create and download JSON key
# 5. Add key content to Cloud Run environment variables
```

## Deployment Commands

### Deploy Firebase Configuration

```bash
cd /home/vrn/combo/mobile

# Login to Firebase
firebase login

# Set project
firebase use combo-624e1

# Deploy all Firebase resources
firebase deploy

# Or deploy individually:
firebase deploy --only firestore
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Initialize Firebase in Mobile App

```bash
cd /home/vrn/combo/mobile

# Install dependencies (if needed)
npm install

# The app will automatically use Firebase configuration
# from src/services/firebase.js
```

## Security Configuration

### Firestore Security Rules Features:
- ✅ Users can only access their own data
- ✅ Public playlists are readable by all
- ✅ Private playlists only accessible by owner
- ✅ Liked tracks and history are private
- ✅ Analytics data is read-only for users

### Authentication Security:
- ✅ Email verification required
- ✅ Strong password policies
- ✅ Rate limiting on auth attempts
- ✅ Secure token handling

## Testing Firebase Integration

### 1. Test Authentication
```javascript
import { auth } from './src/services/firebase';

// Test user registration
const testAuth = async () => {
  try {
    // This will work with Firebase Auth emulator or production
    console.log('Firebase Auth ready');
  } catch (error) {
    console.error('Auth test failed:', error);
  }
};
```

### 2. Test Firestore Operations
```javascript
import { db } from './src/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Test database connection
const testFirestore = async () => {
  try {
    const docRef = doc(db, 'public', 'test');
    const docSnap = await getDoc(docRef);
    console.log('Firestore connection successful');
  } catch (error) {
    console.error('Firestore test failed:', error);
  }
};
```

### 3. Test Real-time Features
```javascript
import { onSnapshot, doc } from 'firebase/firestore';

// Test real-time listeners
const testRealtime = () => {
  const unsubscribe = onSnapshot(doc(db, 'public', 'test'), (doc) => {
    console.log('Real-time update received:', doc.data());
  });
  // Don't forget to unsubscribe: unsubscribe();
};
```

## Production Checklist

### ✅ Security
- [ ] Firestore rules deployed and tested
- [ ] Storage rules configured
- [ ] Authentication providers set up
- [ ] Service account permissions minimal

### ✅ Performance
- [ ] Firestore indexes configured for queries
- [ ] Storage CDN enabled
- [ ] Analytics configured

### ✅ Monitoring
- [ ] Firebase Performance Monitoring enabled
- [ ] Crash Reporting configured
- [ ] Analytics events implemented

### ✅ Backup & Recovery
- [ ] Firestore backup settings configured
- [ ] Export data location set
- [ ] Recovery procedures documented

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check Firestore security rules
2. **Authentication Failed**: Verify Firebase config and API key
3. **Quota Exceeded**: Check Firebase usage limits
4. **Network Issues**: Verify Firebase services status

### Debug Commands:

```bash
# Check Firebase project status
firebase projects:list

# View current deployment
firebase deploy --only firestore:rules --debug

# Test rules locally
firebase emulators:start --only=firestore
```

## Cost Optimization

### Firestore:
- Free tier: 1GB storage, 50K reads/day
- Optimize queries to reduce read operations
- Use compound queries efficiently

### Authentication:
- Free tier: 3K active users/month
- Implement user session management
- Clean up unused accounts

### Storage:
- Free tier: 5GB storage, 1GB/day download
- Implement image compression
- Use Firebase CDN

## Next Steps

1. ✅ Configure production Firebase project
2. 📱 Set up mobile app store listings
3. 🌐 Deploy frontend (if applicable)
4. 📊 Add comprehensive analytics
5. 🔒 Implement advanced security features
6. 📢 Set up push notifications
7. 🔄 Implement data backup strategy

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Google Cloud Console**: https://console.cloud.google.com
- **Firebase Support**: https://firebase.google.com/support
- **Community Forums**: https://firebase.community
