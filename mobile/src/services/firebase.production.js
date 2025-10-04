import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Production Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB6z2oJLGZtz9Rk9HqHhmR2kk-h5r4VVSM',
  authDomain: 'combo-624e1.firebaseapp.com',
  databaseURL: 'https://combo-624e1-default-rtdb.firebaseio.com',
  projectId: 'combo-624e1',
  storageBucket: 'combo-624e1.firebasestorage.app',
  messagingSenderId: '531640636721',
  appId: '1:531640636721:web:3431d1a031e5ce6a9b4c10',
  measurementId: 'G-SVP5FX20GH',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore
export const rtdb = getDatabase(app); // Realtime Database

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics initialization skipped');
  }
}

export { analytics };
export default app;
