import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import TrackPlayer, { State as TrackPlayerState } from 'react-native-track-player';

// Mock API functions
const trackAPI = {
  getTrack: async (id) => ({
    data: {
      track: {
        id,
        title: `Track ${id}`,
        artist: `Artist ${id}`,
        album: `Album ${id}`,
        duration: 180,
        artwork: null,
        url: `https://example.com/track-${id}.mp3`
      }
    }
  }),
  getTracks: async (ids) => ({
    data: {
      tracks: ids.map(id => ({
        id,
        title: `Track ${id}`,
        artist: `Artist ${id}`,
        album: `Album ${id}`,
        duration: 180,
        artwork: null,
        url: `https://example.com/track-${id}.mp3`
      }))
    }
  })
};

const analyticsAPI = {
  trackPlay: async (trackId) => {
    console.log(`Analytics: Track played - ${trackId}`);
  },
  trackPause: async (trackId) => {
    console.log(`Analytics: Track paused - ${trackId}`);
  },
  trackSkip: async (trackId) => {
    console.log(`Analytics: Track skipped - ${trackId}`);
  }
};

export const setupPlayer = createAsyncThunk(
  'player/setup',
  async (_, { rejectWithValue }) => {
    try {
      // Setup player using the playerService
      const { setupPlayer: setupPlayerService } = await import('../services/playerService');
      const success = await setupPlayerService();

      if (success) {
        return true;
      } else {
        throw new Error('Failed to setup player');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTracksToQueue = createAsyncThunk(
  'player/addTracks',
  async (tracks, { rejectWithValue, dispatch }) => {
    try {
      // Add tracks using the playerService
      const { addTracks } = await import('../services/playerService');
      const success = await addTracks(tracks);

      if (success) {
        return tracks;
      } else {
        throw new Error('Failed to add tracks');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const playTrack = createAsyncThunk(
  'player/playTrack',
  async (track, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const currentQueue = state.player.queue;

      // If it's a new track, add it to the queue first
      if (!currentQueue.some(t => t.id === track.id)) {
        const newQueue = [...currentQueue, track];
        await dispatch(addTracksToQueue(newQueue));
      }

      // Find the track index and play it
      const trackIndex = currentQueue.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        await TrackPlayer.skip(trackIndex);
        await TrackPlayer.play();

        // Track analytics
        await analyticsAPI.trackPlay(track.id, {
          source: 'direct',
          timestamp: new Date().toISOString(),
        });

        return { track, index: trackIndex };
      } else {
        throw new Error('Track not found in queue');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const togglePlayback = createAsyncThunk(
  'player/togglePlayback',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState().player;
      const playbackState = await TrackPlayer.getState();

      if (playbackState === TrackPlayerState.Playing) {
        await TrackPlayer.pause();
        return 'paused';
      } else {
        await TrackPlayer.play();
        return 'playing';
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const skipToNext = createAsyncThunk(
  'player/skipToNext',
  async (_, { rejectWithValue, getState }) => {
    try {
      await TrackPlayer.skipToNext();
      const currentTrack = await TrackPlayer.getCurrentTrack();
      const track = await TrackPlayer.getTrack(currentTrack);

      return track;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const skipToPrevious = createAsyncThunk(
  'player/skipToPrevious',
  async (_, { rejectWithValue, getState }) => {
    try {
      const currentTrack = await TrackPlayer.getCurrentTrack();
      const currentPosition = await TrackPlayer.getPosition();

      // If we're more than 3 seconds into the song, restart it
      if (currentPosition > 3) {
        await TrackPlayer.seekTo(0);
        return await TrackPlayer.getCurrentTrack();
      } else {
        await TrackPlayer.skipToPrevious();
        const track = await TrackPlayer.getCurrentTrack();
        return track;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const seekTo = createAsyncThunk(
  'player/seekTo',
  async (position, { rejectWithValue }) => {
    try {
      await TrackPlayer.seekTo(position);
      return position;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Current playback state
  currentTrack: null,
  currentIndex: 0,
  playbackState: TrackPlayerState.None,
  isPlaying: false,
  isPaused: false,
  isBuffering: false,
  isStopped: true,

  // Queue
  queue: [],
  originalQueue: [],

  // Playback settings
  repeatMode: 'off', // 'off', 'one', 'all'
  shuffleMode: false,
  volume: 1.0,
  isMuted: false,

  // Progress
  progress: {
    position: 0,
    duration: 0,
    buffered: 0,
  },

  // Player setup
  isPlayerReady: false,
  setupError: null,

  // Loading states
  isLoading: false,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setPlaybackState: (state, action) => {
      state.isPlaying = action.payload.isPlaying;
      state.isPaused = action.payload.isPaused;
      state.isStopped = action.payload.isStopped;
      state.isBuffering = action.payload.isBuffering;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
      state.originalQueue = [...action.payload];
    },
    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },
    setShuffleMode: (state, action) => {
      state.shuffleMode = action.payload;

      if (action.payload && state.queue.length > 0) {
        // Shuffle the queue
        const currentTrack = state.currentTrack;
        const remainingTracks = state.queue.slice(state.currentIndex + 1);
        const shuffled = [...remainingTracks].sort(() => Math.random() - 0.5);

        state.queue = [
          ...state.queue.slice(0, state.currentIndex + 1),
          ...shuffled,
        ];
      } else if (!action.payload) {
        // Restore original queue order
        state.queue = [...state.originalQueue];
      }
    },
    setVolume: (state, action) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setPlayerReady: (state, action) => {
      state.isPlayerReady = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateQueue: (state, action) => {
      const { index, track } = action.payload;
      if (index >= 0 && index < state.queue.length) {
        state.queue[index] = track;
      }
    },
    removeFromQueue: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.queue.length) {
        state.queue.splice(index, 1);

        // Adjust current index if necessary
        if (index < state.currentIndex) {
          state.currentIndex -= 1;
        } else if (index === state.currentIndex && state.queue.length === 0) {
          state.currentIndex = 0;
          state.currentTrack = null;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Setup Player
      .addCase(setupPlayer.pending, (state) => {
        state.isLoading = true;
        state.setupError = null;
      })
      .addCase(setupPlayer.fulfilled, (state) => {
        state.isLoading = false;
        state.isPlayerReady = true;
      })
      .addCase(setupPlayer.rejected, (state, action) => {
        state.isLoading = false;
        state.setupError = action.payload;
      })

      // Add Tracks to Queue
      .addCase(addTracksToQueue.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTracksToQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.queue = action.payload;
        state.originalQueue = [...action.payload];
      })
      .addCase(addTracksToQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Play Track
      .addCase(playTrack.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(playTrack.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrack = action.payload.track;
        state.currentIndex = action.payload.index;
        state.isPlaying = true;
        state.isPaused = false;
        state.isStopped = false;
      })
      .addCase(playTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Playback
      .addCase(togglePlayback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(togglePlayback.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload === 'playing') {
          state.isPlaying = true;
          state.isPaused = false;
          state.isStopped = false;
        } else {
          state.isPlaying = false;
          state.isPaused = true;
          state.isStopped = false;
        }
      })
      .addCase(togglePlayback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Skip to Next
      .addCase(skipToNext.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(skipToNext.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrack = action.payload;
        state.currentIndex += 1;
      })
      .addCase(skipToNext.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Skip to Previous
      .addCase(skipToPrevious.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(skipToPrevious.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrack = action.payload;
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      })
      .addCase(skipToPrevious.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Seek To
      .addCase(seekTo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(seekTo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress.position = action.payload;
      })
      .addCase(seekTo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentTrack,
  setPlaybackState,
  setProgress,
  setQueue,
  setRepeatMode,
  setShuffleMode,
  setVolume,
  toggleMute,
  setPlayerReady,
  setError,
  clearError,
  updateQueue,
  removeFromQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
