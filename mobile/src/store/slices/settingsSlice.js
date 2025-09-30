import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsAPI } from '../services/api';

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Try to load from API first
      const response = await settingsAPI.getSettings();
      return response.data.settings;
    } catch (error) {
      // Fallback to local storage
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return null;
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings, { rejectWithValue }) => {
    try {
      // Save to API
      const response = await settingsAPI.updateSettings(settings);

      // Also save to local storage as backup
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));

      return response.data.settings;
    } catch (error) {
      // Even if API fails, save to local storage
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      return rejectWithValue(error.response?.data?.message || 'Failed to save settings');
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      const defaultSettings = {
        // Audio settings
        audioQuality: 'high',
        downloadQuality: 'high',
        streamingQuality: 'high',
        equalizerEnabled: false,
        volumeNormalization: true,
        gaplessPlayback: true,

        // Playback settings
        autoplay: true,
        crossfade: false,
        crossfadeDuration: 3,
        repeatMode: 'off',
        shuffleMode: false,

        // Download settings
        downloadOverWifi: true,
        downloadOverCellular: false,
        autoDownloadLiked: false,
        storageLocation: 'internal',

        // Notification settings
        pushNotifications: true,
        newMusicNotifications: true,
        friendActivityNotifications: true,
        playlistUpdateNotifications: false,

        // Privacy settings
        privateProfile: false,
        showListeningActivity: true,
        allowMessages: true,
        dataCollection: true,

        // Display settings
        theme: 'dark',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',

        // Social settings
        shareListeningActivity: true,
        sharePlaylists: true,
        shareTracks: true,
        allowTagging: true,
      };

      // Reset on API
      await settingsAPI.resetSettings();

      // Also reset local storage
      await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));

      return defaultSettings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotifications',
  async (notificationSettings, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updateNotificationSettings(notificationSettings);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notifications');
    }
  }
);

export const updatePrivacySettings = createAsyncThunk(
  'settings/updatePrivacy',
  async (privacySettings, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.updatePrivacySettings(privacySettings);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update privacy');
    }
  }
);

const initialState = {
  // Audio settings
  audioQuality: 'high', // 'low', 'medium', 'high'
  downloadQuality: 'high',
  streamingQuality: 'high',
  equalizerEnabled: false,
  volumeNormalization: true,
  gaplessPlayback: true,

  // Playback settings
  autoplay: true,
  crossfade: false,
  crossfadeDuration: 3,
  repeatMode: 'off', // 'off', 'one', 'all'
  shuffleMode: false,

  // Download settings
  downloadOverWifi: true,
  downloadOverCellular: false,
  autoDownloadLiked: false,
  storageLocation: 'internal', // 'internal', 'external'

  // Notification settings
  pushNotifications: true,
  newMusicNotifications: true,
  friendActivityNotifications: true,
  playlistUpdateNotifications: false,

  // Privacy settings
  privateProfile: false,
  showListeningActivity: true,
  allowMessages: true,
  dataCollection: true,

  // Display settings
  theme: 'dark', // 'light', 'dark', 'system'
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',

  // Social settings
  shareListeningActivity: true,
  sharePlaylists: true,
  shareTracks: true,
  allowTagging: true,

  // UI state
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      if (state.hasOwnProperty(key)) {
        state[key] = value;
      }
    },
    updateMultipleSettings: (state, action) => {
      Object.keys(action.payload).forEach(key => {
        if (state.hasOwnProperty(key)) {
          state[key] = action.payload[key];
        }
      });
    },
    resetToDefaults: (state) => {
      const defaultSettings = {
        audioQuality: 'high',
        downloadQuality: 'high',
        streamingQuality: 'high',
        equalizerEnabled: false,
        volumeNormalization: true,
        gaplessPlayback: true,
        autoplay: true,
        crossfade: false,
        crossfadeDuration: 3,
        repeatMode: 'off',
        shuffleMode: false,
        downloadOverWifi: true,
        downloadOverCellular: false,
        autoDownloadLiked: false,
        storageLocation: 'internal',
        pushNotifications: true,
        newMusicNotifications: true,
        friendActivityNotifications: true,
        playlistUpdateNotifications: false,
        privateProfile: false,
        showListeningActivity: true,
        allowMessages: true,
        dataCollection: true,
        theme: 'dark',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        shareListeningActivity: true,
        sharePlaylists: true,
        shareTracks: true,
        allowTagging: true,
      };

      Object.keys(defaultSettings).forEach(key => {
        state[key] = defaultSettings[key];
      });
    },
    setLastSaved: (state, action) => {
      state.lastSaved = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          Object.keys(action.payload).forEach(key => {
            if (state.hasOwnProperty(key)) {
              state[key] = action.payload[key];
            }
          });
        }
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Save Settings
      .addCase(saveSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSaved = new Date().toISOString();
        // Update state with saved values
        Object.keys(action.payload).forEach(key => {
          if (state.hasOwnProperty(key)) {
            state[key] = action.payload[key];
          }
        });
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Reset Settings
      .addCase(resetSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSaved = new Date().toISOString();
        // Update state with default values
        Object.keys(action.payload).forEach(key => {
          state[key] = action.payload[key];
        });
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Update Notification Settings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        Object.keys(action.payload).forEach(key => {
          if (state.hasOwnProperty(key)) {
            state[key] = action.payload[key];
          }
        });
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Update Privacy Settings
      .addCase(updatePrivacySettings.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.isSaving = false;
        Object.keys(action.payload).forEach(key => {
          if (state.hasOwnProperty(key)) {
            state[key] = action.payload[key];
          }
        });
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLoading,
  setSaving,
  setError,
  clearError,
  updateSetting,
  updateMultipleSettings,
  resetToDefaults,
  setLastSaved,
} = settingsSlice.actions;

export default settingsSlice.reducer;
