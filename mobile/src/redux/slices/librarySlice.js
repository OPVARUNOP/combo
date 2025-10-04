import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as libraryService from '../../services/libraryService';

const initialState = {
  playlists: [],
  favoriteTracks: [],
  favoriteArtists: [],
  downloadedTracks: [],
  recentlyPlayed: [],
  listeningHistory: [],
  loading: false,
  error: null,
};

export const fetchPlaylists = createAsyncThunk(
  'library/fetchPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await libraryService.getUserPlaylists();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createPlaylist = createAsyncThunk(
  'library/createPlaylist',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await libraryService.createPlaylist(playlistData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchDownloadedTracks = createAsyncThunk(
  'library/fetchDownloadedTracks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await libraryService.getDownloadedTracks();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addToFavorites: (state, action) => {
      const track = action.payload;
      if (!state.favoriteTracks.find((t) => t.id === track.id)) {
        state.favoriteTracks.push(track);
      }
    },
    removeFromFavorites: (state, action) => {
      const trackId = action.payload;
      state.favoriteTracks = state.favoriteTracks.filter((t) => t.id !== trackId);
    },
    addToRecentlyPlayed: (state, action) => {
      const track = action.payload;
      const existingIndex = state.recentlyPlayed.findIndex((t) => t.id === track.id);

      if (existingIndex > -1) {
        state.recentlyPlayed.splice(existingIndex, 1);
      }

      state.recentlyPlayed.unshift(track);

      // Keep only last 50 tracks
      if (state.recentlyPlayed.length > 50) {
        state.recentlyPlayed = state.recentlyPlayed.slice(0, 50);
      }
    },
    addToHistory: (state, action) => {
      const track = action.payload;
      state.listeningHistory.push({
        ...track,
        playedAt: new Date().toISOString(),
      });

      // Keep only last 1000 tracks in history
      if (state.listeningHistory.length > 1000) {
        state.listeningHistory = state.listeningHistory.slice(-1000);
      }
    },
    addDownloadedTrack: (state, action) => {
      const track = action.payload;
      if (!state.downloadedTracks.find((t) => t.id === track.id)) {
        state.downloadedTracks.push(track);
      }
    },
    removeDownloadedTrack: (state, action) => {
      const trackId = action.payload;
      state.downloadedTracks = state.downloadedTracks.filter((t) => t.id !== trackId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPlaylist.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists.push(action.payload);
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDownloadedTracks.fulfilled, (state, action) => {
        state.downloadedTracks = action.payload;
      });
  },
});

export const {
  clearError,
  addToFavorites,
  removeFromFavorites,
  addToRecentlyPlayed,
  addToHistory,
  addDownloadedTrack,
  removeDownloadedTrack,
} = librarySlice.actions;

export default librarySlice.reducer;
