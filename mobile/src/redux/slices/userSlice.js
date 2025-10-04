import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';

const initialState = {
  profile: null,
  preferences: {
    theme: 'dark',
    language: 'en',
    explicitContent: false,
    downloadQuality: 'high',
    streamingQuality: 'high',
    autoplay: true,
    crossfade: false,
    crossfadeDuration: 3,
    normalizeVolume: true,
    showNotifications: true,
    downloadOverCellular: false,
  },
  stats: {
    totalListeningTime: 0,
    tracksPlayed: 0,
    favoriteGenres: [],
    topArtists: [],
    topTracks: [],
  },
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    addListeningTime: (state, action) => {
      state.stats.totalListeningTime += action.payload;
    },
    incrementTracksPlayed: (state) => {
      state.stats.tracksPlayed += 1;
    },
    updateFavoriteGenres: (state, action) => {
      state.stats.favoriteGenres = action.payload;
    },
    updateTopArtists: (state, action) => {
      state.stats.topArtists = action.payload;
    },
    updateTopTracks: (state, action) => {
      state.stats.topTracks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.preferences = {
          ...state.preferences,
          ...action.payload.preferences,
        };
        state.stats = { ...state.stats, ...action.payload.stats };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      });
  },
});

export const {
  clearError,
  updatePreference,
  updateStats,
  addListeningTime,
  incrementTracksPlayed,
  updateFavoriteGenres,
  updateTopArtists,
  updateTopTracks,
} = userSlice.actions;

export default userSlice.reducer;
