// Firebase configuration and utilities
import { app, db, auth, rtdb } from './firebase';

// Firebase utilities
export const firebaseUtils = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp) => {
    if (!timestamp) {
      return null;
    }
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp: (date) => {
    return new Date(date);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return auth.currentUser !== null;
  },

  // Get current user ID
  getCurrentUserId: () => {
    const user = auth.currentUser;
    return user ? user.uid : null;
  },

  // Get current user email
  getCurrentUserEmail: () => {
    const user = auth.currentUser;
    return user ? user.email : null;
  },

  // Format user display name
  getUserDisplayName: (user) => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Generate playlist ID
  generatePlaylistId: () => {
    return `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format track duration
  formatDuration: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

export default firebaseUtils;
