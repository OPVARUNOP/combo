import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { personalizationService } from '../../services/personalizationService';

// Async thunks for API calls
export const fetchUserPreferences = createAsyncThunk(
  'personalization/fetchUserPreferences',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await personalizationService.getUserPreferences(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  'personalization/updateUserPreferences',
  async ({ userId, preferences }, { rejectWithValue }) => {
    try {
      const response = await personalizationService.updateUserPreferences(userId, preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRecommendations = createAsyncThunk(
  'personalization/fetchRecommendations',
  async ({ userId, type = 'general', limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await personalizationService.getRecommendations(userId, type, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const trackUserActivity = createAsyncThunk(
  'personalization/trackUserActivity',
  async ({ userId, activity }, { rejectWithValue }) => {
    try {
      const response = await personalizationService.trackActivity(userId, activity);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  // User preferences
  preferences: {
    favoriteGenres: [],
    preferredArtists: [],
    listeningTime: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    },
    moodPreferences: [],
    languagePreferences: [],
    explicitContent: false,
    autoplayEnabled: true,
  },

  // Recommendations
  recommendations: {
    forYou: [],
    trending: [],
    newReleases: [],
    similarArtists: [],
    moodBased: [],
    discovery: [],
  },

  // Activity tracking
  recentActivities: [],
  listeningHistory: [],

  // Loading states
  loading: {
    preferences: false,
    recommendations: false,
    activities: false,
  },

  // Error states
  errors: {
    preferences: null,
    recommendations: null,
    activities: null,
  },

  // Personalization settings
  personalizationEnabled: true,
  dataCollectionEnabled: true,
  recommendationRefreshRate: 24, // hours
  lastUpdated: null,
};

const personalizationSlice = createSlice({
  name: 'personalization',
  initialState,
  reducers: {
    // Update local preferences (immediate)
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Add activity to local state
    addRecentActivity: (state, action) => {
      state.recentActivities.unshift(action.payload);
      // Keep only last 100 activities
      if (state.recentActivities.length > 100) {
        state.recentActivities = state.recentActivities.slice(0, 100);
      }
    },

    // Add to listening history
    addToListeningHistory: (state, action) => {
      state.listeningHistory.unshift(action.payload);
      // Keep only last 200 tracks
      if (state.listeningHistory.length > 200) {
        state.listeningHistory = state.listeningHistory.slice(0, 200);
      }
    },

    // Update recommendation section
    updateRecommendations: (state, action) => {
      const { type, data } = action.payload;
      state.recommendations[type] = data;
    },

    // Clear errors
    clearErrors: (state) => {
      state.errors = {
        preferences: null,
        recommendations: null,
        activities: null,
      };
    },

    // Toggle personalization features
    togglePersonalization: (state) => {
      state.personalizationEnabled = !state.personalizationEnabled;
    },

    toggleDataCollection: (state) => {
      state.dataCollectionEnabled = !state.dataCollectionEnabled;
    },
  },
  extraReducers: (builder) => {
    // Fetch user preferences
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.errors.preferences = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.errors.preferences = action.payload;
      });

    // Update user preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.errors.preferences = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.errors.preferences = action.payload;
      });

    // Fetch recommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading.recommendations = true;
        state.errors.recommendations = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        const { type, data } = action.payload;
        state.recommendations[type] = data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.errors.recommendations = action.payload;
      });

    // Track user activity
    builder
      .addCase(trackUserActivity.pending, (state) => {
        state.loading.activities = true;
      })
      .addCase(trackUserActivity.fulfilled, (state, action) => {
        state.loading.activities = false;
        // Activity tracking response handled by service
      })
      .addCase(trackUserActivity.rejected, (state, action) => {
        state.loading.activities = false;
        // Silent failure for activity tracking
      });
  },
});

export const {
  updatePreferences,
  addRecentActivity,
  addToListeningHistory,
  updateRecommendations,
  clearErrors,
  togglePersonalization,
  toggleDataCollection,
} = personalizationSlice.actions;

export default personalizationSlice.reducer;
