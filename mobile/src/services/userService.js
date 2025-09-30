import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { db, auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userService = {
  // Get current authenticated user
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          });
        } else {
          resolve(null);
        }
      }, reject);
    });
  },

  // Get user profile from Firestore
  async getUserProfile(userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        // Create default profile for new user
        const defaultProfile = {
          uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          createdAt: serverTimestamp(),
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            autoplay: true,
          },
          stats: {
            totalPlayTime: 0,
            totalTracksPlayed: 0,
            favoriteGenres: [],
            listeningStreak: 0,
          }
        };
        
        await setDoc(userDocRef, defaultProfile);
        return { id: uid, ...defaultProfile };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  },

  // Update user profile in Firestore
  async updateUserProfile(profileData, userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', uid);
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userDocRef, updateData);
      return { id: uid, ...profileData };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message || 'Failed to update user profile');
    }
  },

  // Update user preferences
  async updatePreferences(preferences, userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        preferences: {
          ...preferences
        },
        updatedAt: serverTimestamp(),
      });

      return preferences;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error(error.message || 'Failed to update preferences');
    }
  },

  // Get user statistics
  async getUserStats(userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.stats || {
          totalPlayTime: 0,
          totalTracksPlayed: 0,
          favoriteGenres: [],
          listeningStreak: 0,
        };
      }
      
      return {
        totalPlayTime: 0,
        totalTracksPlayed: 0,
        favoriteGenres: [],
        listeningStreak: 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error(error.message || 'Failed to fetch user stats');
    }
  },

  // Add track to favorites/liked songs
  async addToFavorites(trackId, trackData) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const likedTrackRef = doc(db, 'users', uid, 'likedTracks', trackId);
      await setDoc(likedTrackRef, {
        trackId,
        ...trackData,
        likedAt: serverTimestamp(),
      });

      return { trackId, message: 'Added to favorites' };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error(error.message || 'Failed to add to favorites');
    }
  },

  // Remove track from favorites
  async removeFromFavorites(trackId) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const likedTrackRef = doc(db, 'users', uid, 'likedTracks', trackId);
      await deleteDoc(likedTrackRef);

      return { trackId, message: 'Removed from favorites' };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error(error.message || 'Failed to remove from favorites');
    }
  },

  // Get user's liked tracks
  async getLikedTracks(userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const likedTracksRef = collection(db, 'users', uid, 'likedTracks');
      const q = query(likedTracksRef, orderBy('likedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const likedTracks = [];
      querySnapshot.forEach((doc) => {
        likedTracks.push({ id: doc.id, ...doc.data() });
      });

      return likedTracks;
    } catch (error) {
      console.error('Error getting liked tracks:', error);
      throw new Error(error.message || 'Failed to fetch liked tracks');
    }
  },

  // Add track to recently played
  async addToRecentlyPlayed(trackId, trackData) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const recentlyPlayedRef = collection(db, 'users', uid, 'recentlyPlayed');
      const trackDocRef = doc(recentlyPlayedRef, trackId);
      
      await setDoc(trackDocRef, {
        trackId,
        ...trackData,
        playedAt: serverTimestamp(),
        playCount: 1,
      }, { merge: true });

      return { trackId, message: 'Added to recently played' };
    } catch (error) {
      console.error('Error adding to recently played:', error);
      throw new Error(error.message || 'Failed to add to recently played');
    }
  },

  // Get recently played tracks
  async getRecentlyPlayed(limit = 20, userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const recentlyPlayedRef = collection(db, 'users', uid, 'recentlyPlayed');
      const q = query(recentlyPlayedRef, orderBy('playedAt', 'desc'), limit(limit));
      const querySnapshot = await getDocs(q);
      
      const recentlyPlayed = [];
      querySnapshot.forEach((doc) => {
        recentlyPlayed.push({ id: doc.id, ...doc.data() });
      });

      return recentlyPlayed;
    } catch (error) {
      console.error('Error getting recently played:', error);
      throw new Error(error.message || 'Failed to fetch recently played');
    }
  },

  // Track listening history
  async trackListening(trackId, trackData, duration = 0, position = 0) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const historyRef = collection(db, 'users', uid, 'listeningHistory');
      await addDoc(historyRef, {
        trackId,
        ...trackData,
        playedAt: serverTimestamp(),
        duration,
        position,
        completionRate: position > 0 ? Math.min(position / duration, 1) : 0,
      });

      return { trackId, message: 'Listening tracked' };
    } catch (error) {
      console.error('Error tracking listening:', error);
      throw new Error(error.message || 'Failed to track listening');
    }
  },

  // Get listening history
  async getListeningHistory(limit = 50, userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const historyRef = collection(db, 'users', uid, 'listeningHistory');
      const q = query(historyRef, orderBy('playedAt', 'desc'), limit(limit));
      const querySnapshot = await getDocs(q);
      
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });

      return history;
    } catch (error) {
      console.error('Error getting listening history:', error);
      throw new Error(error.message || 'Failed to fetch listening history');
    }
  },

  // Update user statistics
  async updateUserStats(statsUpdate, userId = null) {
    try {
      const currentUser = await this.getCurrentUser();
      const uid = userId || currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        stats: {
          ...statsUpdate
        },
        updatedAt: serverTimestamp(),
      });

      return statsUpdate;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw new Error(error.message || 'Failed to update user stats');
    }
  },

  // Sign out user
  async signOutUser() {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      return { message: 'User signed out successfully' };
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  // Listen to real-time user data changes
  onUserProfileChange(userId = null, callback) {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userDocRef = doc(db, 'users', currentUser);
      return onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      });
    } catch (error) {
      console.error('Error listening to user profile changes:', error);
      throw new Error(error.message || 'Failed to listen to profile changes');
    }
  },
};
