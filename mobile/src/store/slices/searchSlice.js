import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackAPI, playlistAPI, albumAPI, artistAPI, userAPI } from '../services/api';

// Async thunks for search
export const searchTracks = createAsyncThunk(
  'search/searchTracks',
  async ({ query, filters = {}, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await trackAPI.search(query, {
        ...filters,
        limit,
        offset,
      });
      return {
        tracks: response.data.tracks || [],
        total: response.data.total || 0,
        hasMore: offset + limit < (response.data.total || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search tracks');
    }
  },
);

export const searchPlaylists = createAsyncThunk(
  'search/searchPlaylists',
  async ({ query, filters = {}, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await playlistAPI.search(query, {
        ...filters,
        limit,
        offset,
      });
      return {
        playlists: response.data.playlists || [],
        total: response.data.total || 0,
        hasMore: offset + limit < (response.data.total || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search playlists');
    }
  },
);

export const searchAlbums = createAsyncThunk(
  'search/searchAlbums',
  async ({ query, filters = {}, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await albumAPI.search(query, {
        ...filters,
        limit,
        offset,
      });
      return {
        albums: response.data.albums || [],
        total: response.data.total || 0,
        hasMore: offset + limit < (response.data.total || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search albums');
    }
  },
);

export const searchArtists = createAsyncThunk(
  'search/searchArtists',
  async ({ query, filters = {}, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await artistAPI.search(query, {
        ...filters,
        limit,
        offset,
      });
      return {
        artists: response.data.artists || [],
        total: response.data.total || 0,
        hasMore: offset + limit < (response.data.total || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search artists');
    }
  },
);

export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async ({ query, filters = {}, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.search(query, {
        ...filters,
        limit,
        offset,
      });
      return {
        users: response.data.users || [],
        total: response.data.total || 0,
        hasMore: offset + limit < (response.data.total || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  },
);

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async ({ query, filters = {}, limit = 10 }, { rejectWithValue }) => {
    try {
      const [tracksRes, playlistsRes, albumsRes, artistsRes] = await Promise.allSettled([
        trackAPI.search(query, { ...filters, limit }),
        playlistAPI.search(query, { ...filters, limit }),
        albumAPI.search(query, { ...filters, limit }),
        artistAPI.search(query, { ...filters, limit }),
      ]);

      return {
        tracks: tracksRes.status === 'fulfilled' ? tracksRes.value.data.tracks || [] : [],
        playlists:
          playlistsRes.status === 'fulfilled' ? playlistsRes.value.data.playlists || [] : [],
        albums: albumsRes.status === 'fulfilled' ? albumsRes.value.data.albums || [] : [],
        artists: artistsRes.status === 'fulfilled' ? artistsRes.value.data.artists || [] : [],
        error: tracksRes.status === 'rejected' ? tracksRes.reason : null,
      };
    } catch (error) {
      return rejectWithValue('Search failed');
    }
  },
);

// Async thunks for search history and suggestions
export const addToSearchHistory = createAsyncThunk(
  'search/addToHistory',
  async (query, { rejectWithValue, getState }) => {
    try {
      const state = getState().search;
      const newHistory = [query, ...state.searchHistory.filter((h) => h !== query)].slice(0, 50);
      return newHistory;
    } catch (error) {
      return rejectWithValue('Failed to add to search history');
    }
  },
);

export const clearSearchHistory = createAsyncThunk(
  'search/clearHistory',
  async (_, { rejectWithValue }) => {
    try {
      return [];
    } catch (error) {
      return rejectWithValue('Failed to clear search history');
    }
  },
);

export const getSearchSuggestions = createAsyncThunk(
  'search/getSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      const response = await trackAPI.search(query, { limit: 5 });
      const tracks = response.data.tracks || [];

      const suggestions = tracks.map((track) => ({
        id: track.id,
        type: 'track',
        title: track.title,
        subtitle: track.artist,
        image: track.artwork,
      }));

      return suggestions;
    } catch (error) {
      return rejectWithValue('Failed to get search suggestions');
    }
  },
);

// Async thunks for trending searches
export const fetchTrendingSearches = createAsyncThunk(
  'search/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trackAPI.getTrending({ limit: 10 });
      return response.data.trending || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch trending searches');
    }
  },
);

const initialState = {
  // Search query and results
  currentQuery: '',
  searchResults: {
    tracks: [],
    playlists: [],
    albums: [],
    artists: [],
    users: [],
    all: [],
  },
  searchTotals: {
    tracks: 0,
    playlists: 0,
    albums: 0,
    artists: 0,
    users: 0,
  },
  hasMore: {
    tracks: false,
    playlists: false,
    albums: false,
    artists: false,
    users: false,
  },

  // Search history and suggestions
  searchHistory: [],
  searchSuggestions: [],
  trendingSearches: [],

  // Filters
  activeFilters: {
    type: 'all', // 'all', 'tracks', 'playlists', 'albums', 'artists', 'users'
    genre: '',
    year: '',
    sortBy: 'relevance',
    duration: '',
    mood: '',
  },

  // Advanced search
  advancedSearch: {
    lyrics: '',
    artist: '',
    album: '',
    yearFrom: '',
    yearTo: '',
    genre: '',
    durationMin: '',
    durationMax: '',
    bpmMin: '',
    bpmMax: '',
    key: '',
    mood: '',
  },

  // Search state
  isSearching: false,
  isLoadingMore: false,
  searchError: null,
  lastSearchTime: null,

  // Voice search
  isVoiceSearchActive: false,
  voiceSearchResult: null,

  // Search settings
  searchSettings: {
    autoComplete: true,
    saveHistory: true,
    showSuggestions: true,
    searchInLyrics: false,
    searchInDescriptions: true,
    safeSearch: true,
  },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    setAdvancedSearch: (state, action) => {
      state.advancedSearch = { ...state.advancedSearch, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = {
        tracks: [],
        playlists: [],
        albums: [],
        artists: [],
        users: [],
        all: [],
      };
      state.searchTotals = {
        tracks: 0,
        playlists: 0,
        albums: 0,
        artists: 0,
        users: 0,
      };
      state.hasMore = {
        tracks: false,
        playlists: false,
        albums: false,
        artists: false,
        users: false,
      };
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    setSearchSettings: (state, action) => {
      state.searchSettings = { ...state.searchSettings, ...action.payload };
    },
    setVoiceSearchActive: (state, action) => {
      state.isVoiceSearchActive = action.payload;
    },
    setVoiceSearchResult: (state, action) => {
      state.voiceSearchResult = action.payload;
    },
    addToHistory: (state, action) => {
      if (state.searchSettings.saveHistory) {
        state.searchHistory = [
          action.payload,
          ...state.searchHistory.filter((h) => h !== action.payload),
        ].slice(0, 50);
      }
    },
    removeFromSearchHistory: (state, action) => {
      state.searchHistory = state.searchHistory.filter((h) => h !== action.payload);
    },
    setSearchHistory: (state, action) => {
      state.searchHistory = action.payload;
    },
    setSearchSuggestions: (state, action) => {
      state.searchSuggestions = action.payload;
    },
    setTrendingSearches: (state, action) => {
      state.trendingSearches = action.payload;
    },
    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    setLoadingMore: (state, action) => {
      state.isLoadingMore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Tracks
      .addCase(searchTracks.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchTracks.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.tracks = action.payload.tracks;
        state.searchTotals.tracks = action.payload.total;
        state.hasMore.tracks = action.payload.hasMore;
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchTracks.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Search Playlists
      .addCase(searchPlaylists.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchPlaylists.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.playlists = action.payload.playlists;
        state.searchTotals.playlists = action.payload.total;
        state.hasMore.playlists = action.payload.hasMore;
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchPlaylists.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Search Albums
      .addCase(searchAlbums.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchAlbums.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.albums = action.payload.albums;
        state.searchTotals.albums = action.payload.total;
        state.hasMore.albums = action.payload.hasMore;
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchAlbums.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Search Artists
      .addCase(searchArtists.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchArtists.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.artists = action.payload.artists;
        state.searchTotals.artists = action.payload.total;
        state.hasMore.artists = action.payload.hasMore;
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchArtists.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.users = action.payload.users;
        state.searchTotals.users = action.payload.total;
        state.hasMore.users = action.payload.hasMore;
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Search All
      .addCase(searchAll.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = {
          ...state.searchResults,
          ...action.payload,
        };
        state.lastSearchTime = new Date().toISOString();
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Add to Search History
      .addCase(addToSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = action.payload;
      })

      // Clear Search History
      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.searchHistory = [];
      })

      // Get Search Suggestions
      .addCase(getSearchSuggestions.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchSuggestions = action.payload;
      })
      .addCase(getSearchSuggestions.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      })

      // Fetch Trending Searches
      .addCase(fetchTrendingSearches.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(fetchTrendingSearches.fulfilled, (state, action) => {
        state.isSearching = false;
        state.trendingSearches = action.payload;
      })
      .addCase(fetchTrendingSearches.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
      });
  },
});

export const {
  setCurrentQuery,
  setActiveFilters,
  setAdvancedSearch,
  clearSearchResults,
  clearSearchError,
  setSearchSettings,
  setVoiceSearchActive,
  setVoiceSearchResult,
  addToHistory,
  removeFromSearchHistory,
  setSearchHistory,
  setSearchSuggestions,
  setTrendingSearches,
  setSearching,
  setLoadingMore,
} = searchSlice.actions;

export default searchSlice.reducer;
