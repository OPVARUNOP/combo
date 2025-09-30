import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as searchService from '../../services/searchService';

const initialState = {
  query: '',
  results: {
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  },
  suggestions: [],
  history: [],
  filters: {
    genre: '',
    artist: '',
    mood: '',
    duration: '',
    sortBy: 'relevance',
  },
  isSearching: false,
  error: null,
  hasMore: true,
  page: 1,
};

export const searchMusic = createAsyncThunk(
  'search/searchMusic',
  async (query, { getState, rejectWithValue }) => {
    try {
      const { search } = getState();
      const response = await searchService.searchMusic(query, {
        filters: search.filters,
        page: search.page,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'search/getSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchService.getSuggestions(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const voiceSearch = createAsyncThunk(
  'search/voiceSearch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.voiceSearch();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearResults: (state) => {
      state.results = {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
      };
      state.hasMore = true;
      state.page = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        genre: '',
        artist: '',
        mood: '',
        duration: '',
        sortBy: 'relevance',
      };
    },
    addToHistory: (state, action) => {
      const query = action.payload;
      const existingIndex = state.history.findIndex(item => item.query === query);

      if (existingIndex > -1) {
        state.history.splice(existingIndex, 1);
      }

      state.history.unshift({
        query,
        timestamp: Date.now(),
      });

      // Keep only last 20 searches
      if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
    removeFromHistory: (state, action) => {
      const index = action.payload;
      state.history.splice(index, 1);
    },
    loadMore: (state) => {
      if (state.hasMore) {
        state.page += 1;
      }
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMusic.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchMusic.fulfilled, (state, action) => {
        state.isSearching = false;
        const { results, hasMore, page } = action.payload;

        if (page === 1) {
          state.results = results;
        } else {
          state.results.tracks = [...state.results.tracks, ...results.tracks];
          state.results.artists = [...state.results.artists, ...results.artists];
          state.results.albums = [...state.results.albums, ...results.albums];
          state.results.playlists = [...state.results.playlists, ...results.playlists];
        }

        state.hasMore = hasMore;
        state.page = page;
      })
      .addCase(searchMusic.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      .addCase(getSuggestions.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.isSearching = false;
        state.suggestions = action.payload;
      })
      .addCase(getSuggestions.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      .addCase(voiceSearch.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(voiceSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.query = action.payload;
      })
      .addCase(voiceSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });
  },
});

export const {
  setQuery,
  clearResults,
  setFilters,
  clearFilters,
  addToHistory,
  clearHistory,
  removeFromHistory,
  loadMore,
  setHasMore,
} = searchSlice.actions;

export default searchSlice.reducer;
