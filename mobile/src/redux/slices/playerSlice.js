import { createSlice } from '@reduxjs/toolkit';
import TrackPlayer, { State, Event } from 'react-native-track-player';

const initialState = {
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  state: State.None,
  playbackState: {
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    isBuffering: false,
  },
  progress: {
    position: 0,
    duration: 0,
    buffered: 0,
  },
  repeatMode: 0, // 0: off, 1: one, 2: all
  shuffleMode: false,
  volume: 1.0,
  speed: 1.0,
  isMiniPlayer: true,
  sleepTimer: null,
  lyrics: null,
  showLyrics: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
      if (state.queue[action.payload]) {
        state.currentTrack = state.queue[action.payload];
      }
    },
    setPlaybackState: (state, action) => {
      state.playbackState = { ...state.playbackState, ...action.payload };
    },
    setProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },
    setShuffleMode: (state, action) => {
      state.shuffleMode = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffleMode = !state.shuffleMode;
    },
    toggleRepeat: (state) => {
      state.repeatMode = (state.repeatMode + 1) % 3;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setMiniPlayer: (state, action) => {
      state.isMiniPlayer = action.payload;
    },
    setLyrics: (state, action) => {
      state.lyrics = action.payload;
    },
    toggleLyrics: (state) => {
      state.showLyrics = !state.showLyrics;
    },
    setSleepTimer: (state, action) => {
      state.sleepTimer = action.payload;
    },
    clearSleepTimer: (state) => {
      state.sleepTimer = null;
    },
    nextTrack: (state) => {
      if (state.shuffleMode) {
        state.currentIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        state.currentIndex = (state.currentIndex + 1) % state.queue.length;
      }
      state.currentTrack = state.queue[state.currentIndex];
    },
    previousTrack: (state) => {
      if (state.currentIndex === 0) {
        state.currentIndex = state.queue.length - 1;
      } else {
        state.currentIndex -= 1;
      }
      state.currentTrack = state.queue[state.currentIndex];
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action) => {
      const index = action.payload;
      state.queue.splice(index, 1);
      if (index < state.currentIndex) {
        state.currentIndex -= 1;
      } else if (index === state.currentIndex) {
        if (state.queue.length === 0) {
          state.currentTrack = null;
          state.currentIndex = 0;
        } else {
          state.currentTrack = state.queue[state.currentIndex];
        }
      }
    },
    reorderQueue: (state, action) => {
      const { from, to } = action.payload;
      const item = state.queue.splice(from, 1)[0];
      state.queue.splice(to, 0, item);

      if (from === state.currentIndex) {
        state.currentIndex = to;
      } else if (from < state.currentIndex && to >= state.currentIndex) {
        state.currentIndex -= 1;
      } else if (from > state.currentIndex && to <= state.currentIndex) {
        state.currentIndex += 1;
      }
    },
  },
});

export const {
  setCurrentTrack,
  setQueue,
  setCurrentIndex,
  setPlaybackState,
  setProgress,
  setRepeatMode,
  setShuffleMode,
  toggleShuffle,
  toggleRepeat,
  setVolume,
  setSpeed,
  setMiniPlayer,
  setLyrics,
  toggleLyrics,
  setSleepTimer,
  clearSleepTimer,
  nextTrack,
  previousTrack,
  addToQueue,
  removeFromQueue,
  reorderQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
