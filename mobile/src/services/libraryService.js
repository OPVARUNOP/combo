// DEPRECATED: This file is no longer used. All playlist/library operations should use Firebase services directly.
// See src/services/firebase.js and related Firestore/Realtime Database service files.

export default null;
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from './api';

export const libraryService = {
  // Playlist operations
  async getUserPlaylists() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch playlists');
    }
  },

  async createPlaylist(playlistData) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/playlists`, playlistData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create playlist');
    }
  },

  async updatePlaylist(id, playlistData) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/playlists/${id}`, playlistData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update playlist');
    }
  },

  async deletePlaylist(id) {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete playlist');
    }
  },

  async addTrackToPlaylist(playlistId, trackId) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/playlists/${playlistId}/tracks`,
        { trackId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add track to playlist');
    }
  },

  async removeTrackFromPlaylist(playlistId, trackId) {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { playlistId, trackId };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove track from playlist');
    }
  },

  // Favorite tracks operations
  async getFavoriteTracks() {
    try {
      const favorites = await AsyncStorage.getItem('favoriteTracks');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      throw new Error('Failed to fetch favorite tracks');
    }
  },

  async addToFavorites(trackId) {
    try {
      const favorites = await this.getFavoriteTracks();
      if (!favorites.includes(trackId)) {
        favorites.push(trackId);
        await AsyncStorage.setItem('favoriteTracks', JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      throw new Error('Failed to add to favorites');
    }
  },

  async removeFromFavorites(trackId) {
    try {
      const favorites = await this.getFavoriteTracks();
      const updatedFavorites = favorites.filter((id) => id !== trackId);
      await AsyncStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      throw new Error('Failed to remove from favorites');
    }
  },

  // Downloaded tracks operations
  async getDownloadedTracks() {
    try {
      const downloaded = await AsyncStorage.getItem('downloadedTracks');
      return downloaded ? JSON.parse(downloaded) : [];
    } catch (error) {
      throw new Error('Failed to fetch downloaded tracks');
    }
  },

  async addDownloadedTrack(track) {
    try {
      const downloaded = await this.getDownloadedTracks();
      const existingIndex = downloaded.findIndex((t) => t.id === track.id);

      if (existingIndex >= 0) {
        downloaded[existingIndex] = track;
      } else {
        downloaded.push(track);
      }

      await AsyncStorage.setItem('downloadedTracks', JSON.stringify(downloaded));
      return downloaded;
    } catch (error) {
      throw new Error('Failed to add downloaded track');
    }
  },

  async removeDownloadedTrack(trackId) {
    try {
      const downloaded = await this.getDownloadedTracks();
      const updatedDownloaded = downloaded.filter((track) => track.id !== trackId);
      await AsyncStorage.setItem('downloadedTracks', JSON.stringify(updatedDownloaded));
      return updatedDownloaded;
    } catch (error) {
      throw new Error('Failed to remove downloaded track');
    }
  },

  // Recently played operations
  async getRecentlyPlayed() {
    try {
      const recentlyPlayed = await AsyncStorage.getItem('recentlyPlayed');
      return recentlyPlayed ? JSON.parse(recentlyPlayed) : [];
    } catch (error) {
      throw new Error('Failed to fetch recently played');
    }
  },

  async addToRecentlyPlayed(track) {
    try {
      const recentlyPlayed = await this.getRecentlyPlayed();
      const existingIndex = recentlyPlayed.findIndex((t) => t.id === track.id);

      if (existingIndex >= 0) {
        recentlyPlayed[existingIndex] = {
          ...track,
          playedAt: new Date().toISOString(),
        };
      } else {
        recentlyPlayed.unshift({
          ...track,
          playedAt: new Date().toISOString(),
        });
      }

      // Keep only last 50 tracks
      const trimmed = recentlyPlayed.slice(0, 50);
      await AsyncStorage.setItem('recentlyPlayed', JSON.stringify(trimmed));
      return trimmed;
    } catch (error) {
      throw new Error('Failed to add to recently played');
    }
  },

  // Listening history operations
  async getListeningHistory() {
    try {
      const history = await AsyncStorage.getItem('listeningHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      throw new Error('Failed to fetch listening history');
    }
  },

  async addToListeningHistory(track, duration) {
    try {
      const history = await this.getListeningHistory();
      const historyEntry = {
        track,
        duration,
        timestamp: new Date().toISOString(),
      };

      history.unshift(historyEntry);
      // Keep only last 100 entries
      const trimmed = history.slice(0, 100);
      await AsyncStorage.setItem('listeningHistory', JSON.stringify(trimmed));
      return trimmed;
    } catch (error) {
      throw new Error('Failed to add to listening history');
    }
  },
};
