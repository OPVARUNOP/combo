import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const playlistService = {
  // Get current authenticated user ID
  async getCurrentUserId() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return currentUser.uid;
  },

  // Create a new playlist
  async createPlaylist(playlistData) {
    try {
      const uid = await this.getCurrentUserId();

      const playlistsRef = collection(db, 'playlists');
      const newPlaylist = {
        ...playlistData,
        userId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        trackCount: 0,
        isPublic: playlistData.isPublic || false,
        tracks: [],
      };

      const docRef = await addDoc(playlistsRef, newPlaylist);
      return { id: docRef.id, ...newPlaylist };
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw new Error(error.message || 'Failed to create playlist');
    }
  },

  // Get playlist by ID
  async getPlaylistById(playlistId) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);
      const playlistDoc = await getDoc(playlistDocRef);

      if (playlistDoc.exists()) {
        return { id: playlistDoc.id, ...playlistDoc.data() };
      } else {
        throw new Error('Playlist not found');
      }
    } catch (error) {
      console.error('Error getting playlist:', error);
      throw new Error(error.message || 'Failed to fetch playlist');
    }
  },

  // Get user's playlists
  async getUserPlaylists(userId = null) {
    try {
      const uid = userId || (await this.getCurrentUserId());

      const playlistsRef = collection(db, 'playlists');
      const q = query(playlistsRef, where('userId', '==', uid), orderBy('updatedAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const playlists = [];

      querySnapshot.forEach((doc) => {
        playlists.push({ id: doc.id, ...doc.data() });
      });

      return playlists;
    } catch (error) {
      console.error('Error getting user playlists:', error);
      throw new Error(error.message || 'Failed to fetch playlists');
    }
  },

  // Get all public playlists (for discovery)
  async getPublicPlaylists(limitCount = 20) {
    try {
      const playlistsRef = collection(db, 'playlists');
      const q = query(
        playlistsRef,
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const playlists = [];

      querySnapshot.forEach((doc) => {
        playlists.push({ id: doc.id, ...doc.data() });
      });

      return playlists;
    } catch (error) {
      console.error('Error getting public playlists:', error);
      throw new Error(error.message || 'Failed to fetch public playlists');
    }
  },

  // Update playlist
  async updatePlaylist(playlistId, updateData) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(playlistDocRef, updatePayload);
      return { id: playlistId, ...updateData };
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw new Error(error.message || 'Failed to update playlist');
    }
  },

  // Delete playlist
  async deletePlaylist(playlistId) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);
      await deleteDoc(playlistDocRef);
      return { id: playlistId, message: 'Playlist deleted successfully' };
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw new Error(error.message || 'Failed to delete playlist');
    }
  },

  // Add track to playlist
  async addTrackToPlaylist(playlistId, trackData) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);

      // Get current playlist to update track count
      const playlistDoc = await getDoc(playlistDocRef);
      if (!playlistDoc.exists()) {
        throw new Error('Playlist not found');
      }

      const playlistData = playlistDoc.data();
      const currentTracks = playlistData.tracks || [];

      // Check if track already exists
      const trackExists = currentTracks.some((track) => track.trackId === trackData.trackId);
      if (trackExists) {
        throw new Error('Track already exists in playlist');
      }

      // Add track to playlist
      const newTrack = {
        ...trackData,
        addedAt: serverTimestamp(),
      };

      await updateDoc(playlistDocRef, {
        tracks: arrayUnion(newTrack),
        trackCount: currentTracks.length + 1,
        updatedAt: serverTimestamp(),
      });

      return {
        playlistId,
        track: newTrack,
        message: 'Track added to playlist',
      };
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw new Error(error.message || 'Failed to add track to playlist');
    }
  },

  // Remove track from playlist
  async removeTrackFromPlaylist(playlistId, trackId) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);

      // Get current playlist
      const playlistDoc = await getDoc(playlistDocRef);
      if (!playlistDoc.exists()) {
        throw new Error('Playlist not found');
      }

      const playlistData = playlistDoc.data();
      const currentTracks = playlistData.tracks || [];

      // Find the track to remove
      const trackToRemove = currentTracks.find((track) => track.trackId === trackId);
      if (!trackToRemove) {
        throw new Error('Track not found in playlist');
      }

      // Remove track from playlist
      await updateDoc(playlistDocRef, {
        tracks: arrayRemove(trackToRemove),
        trackCount: Math.max(0, currentTracks.length - 1),
        updatedAt: serverTimestamp(),
      });

      return { playlistId, trackId, message: 'Track removed from playlist' };
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw new Error(error.message || 'Failed to remove track from playlist');
    }
  },

  // Get playlist tracks
  async getPlaylistTracks(playlistId) {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      return playlist.tracks || [];
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      throw new Error(error.message || 'Failed to fetch playlist tracks');
    }
  },

  // Like/unlike playlist
  async likePlaylist(playlistId) {
    try {
      const uid = await this.getCurrentUserId();
      const playlistDocRef = doc(db, 'playlists', playlistId);

      await updateDoc(playlistDocRef, {
        likedBy: arrayUnion(uid),
        updatedAt: serverTimestamp(),
      });

      return { playlistId, message: 'Playlist liked' };
    } catch (error) {
      console.error('Error liking playlist:', error);
      throw new Error(error.message || 'Failed to like playlist');
    }
  },

  async unlikePlaylist(playlistId) {
    try {
      const uid = await this.getCurrentUserId();
      const playlistDocRef = doc(db, 'playlists', playlistId);

      await updateDoc(playlistDocRef, {
        likedBy: arrayRemove(uid),
        updatedAt: serverTimestamp(),
      });

      return { playlistId, message: 'Playlist unliked' };
    } catch (error) {
      console.error('Error unliking playlist:', error);
      throw new Error(error.message || 'Failed to unlike playlist');
    }
  },

  // Get liked playlists
  async getLikedPlaylists(userId = null) {
    try {
      const uid = userId || (await this.getCurrentUserId());

      const playlistsRef = collection(db, 'playlists');
      const q = query(
        playlistsRef,
        where('likedBy', 'array-contains', uid),
        orderBy('updatedAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const playlists = [];

      querySnapshot.forEach((doc) => {
        playlists.push({ id: doc.id, ...doc.data() });
      });

      return playlists;
    } catch (error) {
      console.error('Error getting liked playlists:', error);
      throw new Error(error.message || 'Failed to fetch liked playlists');
    }
  },

  // Search playlists
  async searchPlaylists(searchQuery, limitCount = 20) {
    try {
      const playlistsRef = collection(db, 'playlists');
      const q = query(
        playlistsRef,
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const playlists = [];

      querySnapshot.forEach((doc) => {
        const playlist = { id: doc.id, ...doc.data() };
        // Simple text search in title and description
        if (
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          playlists.push(playlist);
        }
      });

      return playlists;
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw new Error(error.message || 'Failed to search playlists');
    }
  },

  // Get featured/curated playlists
  async getFeaturedPlaylists(limitCount = 10) {
    try {
      // Get playlists with most likes
      const playlistsRef = collection(db, 'playlists');
      const q = query(
        playlistsRef,
        where('isPublic', '==', true),
        orderBy('likedBy', 'desc'),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const playlists = [];

      querySnapshot.forEach((doc) => {
        playlists.push({ id: doc.id, ...doc.data() });
      });

      return playlists;
    } catch (error) {
      console.error('Error getting featured playlists:', error);
      throw new Error(error.message || 'Failed to fetch featured playlists');
    }
  },

  // Real-time listener for playlist changes
  onPlaylistChange(playlistId, callback) {
    try {
      const playlistDocRef = doc(db, 'playlists', playlistId);
      return onSnapshot(playlistDocRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      });
    } catch (error) {
      console.error('Error listening to playlist changes:', error);
      throw new Error(error.message || 'Failed to listen to playlist changes');
    }
  },

  // Real-time listener for user's playlists
  onUserPlaylistsChange(userId = null, callback) {
    try {
      const uid = userId || auth.currentUser?.uid;

      if (!uid) {
        throw new Error('User not authenticated');
      }

      const playlistsRef = collection(db, 'playlists');
      const q = query(playlistsRef, where('userId', '==', uid), orderBy('updatedAt', 'desc'));

      return onSnapshot(q, (querySnapshot) => {
        const playlists = [];
        querySnapshot.forEach((doc) => {
          playlists.push({ id: doc.id, ...doc.data() });
        });
        callback(playlists);
      });
    } catch (error) {
      console.error('Error listening to user playlists changes:', error);
      throw new Error(error.message || 'Failed to listen to playlists changes');
    }
  },
};
