import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Types
type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  rtdb: Database;
  storage: FirebaseStorage;
  analytics: Analytics | null;
};

// Initialize Firebase
let firebaseServices: FirebaseServices | null = null;

export const initializeFirebase = (): FirebaseServices => {
  if (firebaseServices) {
    return firebaseServices;
  }

  // Use environment variables in production
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB6z2oJLGZtz9Rk9HqHhmR2kk-h5r4VVSM',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'combo-624e1.firebaseapp.com',
    databaseURL:
      process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ||
      'https://combo-624e1-default-rtdb.firebaseio.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'combo-624e1',
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'combo-624e1.firebasestorage.app',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '531640636721',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:531640636721:web:3431d1a031e5ce6a9b4c10',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-SVP5FX20GH',
  };

  // Initialize Firebase
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // Initialize services
  const auth = getAuth(app);
  const db = getFirestore(app);
  const rtdb = getDatabase(app);
  const storage = getStorage(app);

  // Initialize Analytics only in browser environment and if not in development
  let analytics: Analytics | null = null;

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    isAnalyticsSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      })
      .catch(() => {
        console.warn('Analytics not supported in this environment');
      });
  }

  firebaseServices = {
    app,
    auth,
    db,
    rtdb,
    storage,
    analytics,
  };

  return firebaseServices;
};

// Export initialized services
export const { app, auth, db, rtdb, storage, analytics } = initializeFirebase();

export default firebaseServices!;
