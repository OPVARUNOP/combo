import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI, analyticsAPI } from '../services/api';

// Async thunks
export const loadUserProfile = createAsyncThunk(
  'user/loadProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load user profile');
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  },
);

export const loadUserStats = createAsyncThunk('user/loadStats', async (_, { rejectWithValue }) => {
  try {
    const response = await userAPI.getStats();
    return response.data.stats;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load user stats');
  }
});

export const loadUserAchievements = createAsyncThunk(
  'user/loadAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getAchievements();
      return response.data.achievements || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load achievements');
    }
  },
);

export const loadListeningHistory = createAsyncThunk(
  'user/loadListeningHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getListeningHistory(params);
      return {
        tracks: response.data.tracks || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load listening history');
    }
  },
);

export const loadUserPreferences = createAsyncThunk(
  'user/loadPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getPreferences();
      return response.data.preferences || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load preferences');
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userAPI.updatePreferences(preferences);
      return response.data.preferences;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  },
);

export const loadFollowers = createAsyncThunk(
  'user/loadFollowers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getFollowers(params);
      return {
        followers: response.data.followers || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load followers');
    }
  },
);

export const loadFollowing = createAsyncThunk(
  'user/loadFollowing',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getFollowing(params);
      return {
        following: response.data.following || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load following');
    }
  },
);

export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userAPI.follow(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  },
);

export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userAPI.unfollow(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  },
);

const initialState = {
  // User profile
  profile: null,
  stats: {
    totalTracks: 0,
    totalMinutes: 0,
    totalPlaylists: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    favoriteGenres: [],
    topArtists: [],
    listeningStreak: 0,
  },
  achievements: [],
  preferences: {
    // Audio preferences
    audioQuality: 'high',
    volumeLevel: 1.0,
    equalizerSettings: {},

    // Playback preferences
    autoplay: true,
    crossfade: false,
    gapless: true,
    repeatMode: 'off',
    shuffleMode: false,

    // Notification preferences
    newMusicNotifications: true,
    friendActivityNotifications: true,
    playlistUpdateNotifications: false,
    emailNotifications: true,

    // Privacy preferences
    profileVisibility: 'public',
    showListeningActivity: true,
    allowMessages: true,
    dataCollection: true,

    // Social preferences
    shareListeningActivity: true,
    sharePlaylists: true,
    shareTracks: true,
    allowTagging: true,

    // Display preferences
    theme: 'dark',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },

  // Social connections
  followers: {
    list: [],
    total: 0,
    hasMore: false,
    isLoading: false,
  },
  following: {
    list: [],
    total: 0,
    hasMore: false,
    isLoading: false,
  },

  // Listening history
  listeningHistory: {
    tracks: [],
    total: 0,
    hasMore: false,
    isLoading: false,
  },

  // Loading states
  isLoadingProfile: false,
  isLoadingStats: false,
  isLoadingAchievements: false,
  isLoadingPreferences: false,

  // Errors
  profileError: null,
  statsError: null,
  achievementsError: null,
  preferencesError: null,

  // UI state
  isEditingProfile: false,
  isEditingPreferences: false,
  activeTab: 'overview', // 'overview', 'stats', 'achievements', 'history', 'social'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoadingProfile: (state, action) => {
      state.isLoadingProfile = action.payload;
    },
    setLoadingStats: (state, action) => {
      state.isLoadingStats = action.payload;
    },
    setLoadingAchievements: (state, action) => {
      state.isLoadingAchievements = action.payload;
    },
    setLoadingPreferences: (state, action) => {
      state.isLoadingPreferences = action.payload;
    },
    setProfileError: (state, action) => {
      state.profileError = action.payload;
    },
    setStatsError: (state, action) => {
      state.statsError = action.payload;
    },
    setAchievementsError: (state, action) => {
      state.achievementsError = action.payload;
    },
    setPreferencesError: (state, action) => {
      state.preferencesError = action.payload;
    },
    clearErrors: (state) => {
      state.profileError = null;
      state.statsError = null;
      state.achievementsError = null;
      state.preferencesError = null;
    },
    setEditingProfile: (state, action) => {
      state.isEditingProfile = action.payload;
    },
    setEditingPreferences: (state, action) => {
      state.isEditingPreferences = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setFollowersLoading: (state, action) => {
      state.followers.isLoading = action.payload;
    },
    setFollowingLoading: (state, action) => {
      state.following.isLoading = action.payload;
    },
    setListeningHistoryLoading: (state, action) => {
      state.listeningHistory.isLoading = action.payload;
    },
    addFollower: (state, action) => {
      const user = action.payload;
      if (!state.followers.list.some((f) => f.id === user.id)) {
        state.followers.list.unshift(user);
        state.followers.total += 1;
      }
    },
    removeFollower: (state, action) => {
      const userId = action.payload;
      state.followers.list = state.followers.list.filter((f) => f.id !== userId);
      state.followers.total = Math.max(0, state.followers.total - 1);
    },
    addFollowing: (state, action) => {
      const user = action.payload;
      if (!state.following.list.some((f) => f.id === user.id)) {
        state.following.list.unshift(user);
        state.following.total += 1;
      }
    },
    removeFollowing: (state, action) => {
      const userId = action.payload;
      state.following.list = state.following.list.filter((f) => f.id !== userId);
      state.following.total = Math.max(0, state.following.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User Profile
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profile = action.payload;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.profileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.profile = action.payload;
        state.isEditingProfile = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.profileError = action.payload;
      })

      // Load User Stats
      .addCase(loadUserStats.pending, (state) => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(loadUserStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(loadUserStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsError = action.payload;
      })

      // Load User Achievements
      .addCase(loadUserAchievements.pending, (state) => {
        state.isLoadingAchievements = true;
        state.achievementsError = null;
      })
      .addCase(loadUserAchievements.fulfilled, (state, action) => {
        state.isLoadingAchievements = false;
        state.achievements = action.payload;
      })
      .addCase(loadUserAchievements.rejected, (state, action) => {
        state.isLoadingAchievements = false;
        state.achievementsError = action.payload;
      })

      // Load Listening History
      .addCase(loadListeningHistory.pending, (state) => {
        state.listeningHistory.isLoading = true;
      })
      .addCase(loadListeningHistory.fulfilled, (state, action) => {
        state.listeningHistory.isLoading = false;
        state.listeningHistory.tracks = action.payload.tracks;
        state.listeningHistory.total = action.payload.total;
        state.listeningHistory.hasMore = action.payload.hasMore;
      })
      .addCase(loadListeningHistory.rejected, (state, action) => {
        state.listeningHistory.isLoading = false;
      })

      // Load User Preferences
      .addCase(loadUserPreferences.pending, (state) => {
        state.isLoadingPreferences = true;
        state.preferencesError = null;
      })
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.isLoadingPreferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(loadUserPreferences.rejected, (state, action) => {
        state.isLoadingPreferences = false;
        state.preferencesError = action.payload;
      })

      // Update User Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.isLoadingPreferences = true;
        state.preferencesError = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.isLoadingPreferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.isEditingPreferences = false;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isLoadingPreferences = false;
        state.preferencesError = action.payload;
      })

      // Load Followers
      .addCase(loadFollowers.pending, (state) => {
        state.followers.isLoading = true;
      })
      .addCase(loadFollowers.fulfilled, (state, action) => {
        state.followers.isLoading = false;
        state.followers.list = action.payload.followers;
        state.followers.total = action.payload.total;
        state.followers.hasMore = action.payload.hasMore;
      })
      .addCase(loadFollowers.rejected, (state) => {
        state.followers.isLoading = false;
      })

      // Load Following
      .addCase(loadFollowing.pending, (state) => {
        state.following.isLoading = true;
      })
      .addCase(loadFollowing.fulfilled, (state, action) => {
        state.following.isLoading = false;
        state.following.list = action.payload.following;
        state.following.total = action.payload.total;
        state.following.hasMore = action.payload.hasMore;
      })
      .addCase(loadFollowing.rejected, (state) => {
        state.following.isLoading = false;
      })

      // Follow/Unfollow User
      .addCase(followUser.fulfilled, (state, action) => {
        // Update would typically come from real-time updates or refetch
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        // Update would typically come from real-time updates or refetch
      });
  },
});

export const {
  setLoadingProfile,
  setLoadingStats,
  setLoadingAchievements,
  setLoadingPreferences,
  setProfileError,
  setStatsError,
  setAchievementsError,
  setPreferencesError,
  clearErrors,
  setEditingProfile,
  setEditingPreferences,
  setActiveTab,
  updateProfile,
  updateStats,
  updatePreferences,
  setFollowersLoading,
  setFollowingLoading,
  setListeningHistoryLoading,
  addFollower,
  removeFollower,
  addFollowing,
  removeFollowing,
} = userSlice.actions;

export default userSlice.reducer;
