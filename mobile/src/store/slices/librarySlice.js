import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackAPI, playlistAPI, albumAPI, artistAPI } from '../services/api';

// Async thunks for tracks
export const fetchLikedTracks = createAsyncThunk(
  'library/fetchLikedTracks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await trackAPI.getAll({ liked: true, ...params });
      return response.data.tracks || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch liked tracks');
    }
  }
);

export const fetchRecentlyPlayed = createAsyncThunk(
  'library/fetchRecentlyPlayed',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await trackAPI.getAll({ recentlyPlayed: true, ...params });
      return response.data.tracks || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recently played');
    }
  }
);

export const fetchDownloadedTracks = createAsyncThunk(
  'library/fetchDownloadedTracks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await trackAPI.getAll({ downloaded: true, ...params });
      return response.data.tracks || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch downloaded tracks');
    }
  }
);

export const likeTrack = createAsyncThunk(
  'library/likeTrack',
  async (trackId, { rejectWithValue }) => {
    try {
      await trackAPI.like(trackId);
      return trackId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like track');
    }
  }
);

export const unlikeTrack = createAsyncThunk(
  'library/unlikeTrack',
  async (trackId, { rejectWithValue }) => {
    try {
      await trackAPI.unlike(trackId);
      return trackId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike track');
    }
  }
);

// Async thunks for playlists
export const fetchMyPlaylists = createAsyncThunk(
  'library/fetchMyPlaylists',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await playlistAPI.getMyPlaylists(params);
      return response.data.playlists || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch playlists');
    }
  }
);

export const fetchLikedPlaylists = createAsyncThunk(
  'library/fetchLikedPlaylists',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await playlistAPI.getLikedPlaylists(params);
      return response.data.playlists || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch liked playlists');
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'library/createPlaylist',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await playlistAPI.create(playlistData);
      return response.data.playlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create playlist');
    }
  }
);

export const likePlaylist = createAsyncThunk(
  'library/likePlaylist',
  async (playlistId, { rejectWithValue }) => {
    try {
      await playlistAPI.like(playlistId);
      return playlistId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like playlist');
    }
  }
);

export const unlikePlaylist = createAsyncThunk(
  'library/unlikePlaylist',
  async (playlistId, { rejectWithValue }) => {
    try {
      await playlistAPI.unlike(playlistId);
      return playlistId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike playlist');
    }
  }
);

// Async thunks for albums
export const fetchMyAlbums = createAsyncThunk(
  'library/fetchMyAlbums',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await albumAPI.getAll(params);
      return response.data.albums || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch albums');
    }
  }
);

// Async thunks for artists
export const fetchFollowedArtists = createAsyncThunk(
  'library/fetchFollowedArtists',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await artistAPI.getAll({ followed: true, ...params });
      return response.data.artists || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followed artists');
    }
  }
);

export const followArtist = createAsyncThunk(
  'library/followArtist',
  async (artistId, { rejectWithValue }) => {
    try {
      await artistAPI.follow(artistId);
      return artistId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow artist');
    }
  }
);

export const unfollowArtist = createAsyncThunk(
  'library/unfollowArtist',
  async (artistId, { rejectWithValue }) => {
    try {
      await artistAPI.unfollow(artistId);
      return artistId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow artist');
    }
  }
);

// Async thunks for downloads
export const downloadTrack = createAsyncThunk(
  'library/downloadTrack',
  async (trackId, { rejectWithValue }) => {
    try {
      await trackAPI.download(trackId);
      return trackId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download track');
    }
  }
);

export const removeDownload = createAsyncThunk(
  'library/removeDownload',
  async (trackId, { rejectWithValue }) => {
    try {
      await trackAPI.removeDownload(trackId);
      return trackId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove download');
    }
  }
);

const initialState = {
  // Tracks
  likedTracks: [],
  recentlyPlayed: [],
  downloadedTracks: [],
  topTracks: [],

  // Playlists
  myPlaylists: [],
  likedPlaylists: [],
  createdPlaylists: [],

  // Albums
  myAlbums: [],
  likedAlbums: [],

  // Artists
  followedArtists: [],
  topArtists: [],

  // Loading states
  isLoadingTracks: false,
  isLoadingPlaylists: false,
  isLoadingAlbums: false,
  isLoadingArtists: false,

  // Errors
  tracksError: null,
  playlistsError: null,
  albumsError: null,
  artistsError: null,

  // Filters and pagination
  tracksFilter: {},
  playlistsFilter: {},
  albumsFilter: {},
  artistsFilter: {},

  // Statistics
  libraryStats: {
    totalTracks: 0,
    totalPlaylists: 0,
    totalAlbums: 0,
    totalArtists: 0,
    totalMinutes: 0,
  },
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setTracksFilter: (state, action) => {
      state.tracksFilter = action.payload;
    },
    setPlaylistsFilter: (state, action) => {
      state.playlistsFilter = action.payload;
    },
    setAlbumsFilter: (state, action) => {
      state.albumsFilter = action.payload;
    },
    setArtistsFilter: (state, action) => {
      state.artistsFilter = action.payload;
    },
    clearTracksError: (state) => {
      state.tracksError = null;
    },
    clearPlaylistsError: (state) => {
      state.playlistsError = null;
    },
    clearAlbumsError: (state) => {
      state.albumsError = null;
    },
    clearArtistsError: (state) => {
      state.artistsError = null;
    },
    updateLibraryStats: (state, action) => {
      state.libraryStats = { ...state.libraryStats, ...action.payload };
    },
    addToLikedTracks: (state, action) => {
      const track = action.payload;
      if (!state.likedTracks.some(t => t.id === track.id)) {
        state.likedTracks.unshift(track);
        state.libraryStats.totalTracks += 1;
      }
    },
    removeFromLikedTracks: (state, action) => {
      const trackId = action.payload;
      state.likedTracks = state.likedTracks.filter(t => t.id !== trackId);
      state.libraryStats.totalTracks = Math.max(0, state.libraryStats.totalTracks - 1);
    },
    addToDownloadedTracks: (state, action) => {
      const track = action.payload;
      if (!state.downloadedTracks.some(t => t.id === track.id)) {
        state.downloadedTracks.push(track);
      }
    },
    removeFromDownloadedTracks: (state, action) => {
      const trackId = action.payload;
      state.downloadedTracks = state.downloadedTracks.filter(t => t.id !== trackId);
    },
    addToMyPlaylists: (state, action) => {
      const playlist = action.payload;
      if (!state.myPlaylists.some(p => p.id === playlist.id)) {
        state.myPlaylists.unshift(playlist);
        state.libraryStats.totalPlaylists += 1;
      }
    },
    removeFromMyPlaylists: (state, action) => {
      const playlistId = action.payload;
      state.myPlaylists = state.myPlaylists.filter(p => p.id !== playlistId);
      state.libraryStats.totalPlaylists = Math.max(0, state.libraryStats.totalPlaylists - 1);
    },
    addToFollowedArtists: (state, action) => {
      const artist = action.payload;
      if (!state.followedArtists.some(a => a.id === artist.id)) {
        state.followedArtists.push(artist);
        state.libraryStats.totalArtists += 1;
      }
    },
    removeFromFollowedArtists: (state, action) => {
      const artistId = action.payload;
      state.followedArtists = state.followedArtists.filter(a => a.id !== artistId);
      state.libraryStats.totalArtists = Math.max(0, state.libraryStats.totalArtists - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Liked Tracks
      .addCase(fetchLikedTracks.pending, (state) => {
        state.isLoadingTracks = true;
        state.tracksError = null;
      })
      .addCase(fetchLikedTracks.fulfilled, (state, action) => {
        state.isLoadingTracks = false;
        state.likedTracks = action.payload;
        state.libraryStats.totalTracks = action.payload.length;
      })
      .addCase(fetchLikedTracks.rejected, (state, action) => {
        state.isLoadingTracks = false;
        state.tracksError = action.payload;
      })

      // Fetch Recently Played
      .addCase(fetchRecentlyPlayed.pending, (state) => {
        state.isLoadingTracks = true;
        state.tracksError = null;
      })
      .addCase(fetchRecentlyPlayed.fulfilled, (state, action) => {
        state.isLoadingTracks = false;
        state.recentlyPlayed = action.payload;
      })
      .addCase(fetchRecentlyPlayed.rejected, (state, action) => {
        state.isLoadingTracks = false;
        state.tracksError = action.payload;
      })

      // Fetch Downloaded Tracks
      .addCase(fetchDownloadedTracks.pending, (state) => {
        state.isLoadingTracks = true;
        state.tracksError = null;
      })
      .addCase(fetchDownloadedTracks.fulfilled, (state, action) => {
        state.isLoadingTracks = false;
        state.downloadedTracks = action.payload;
      })
      .addCase(fetchDownloadedTracks.rejected, (state, action) => {
        state.isLoadingTracks = false;
        state.tracksError = action.payload;
      })

      // Like/Unlike Track
      .addCase(likeTrack.fulfilled, (state, action) => {
        const trackId = action.payload;
        // This would typically update the track's liked status
        // The actual track update would come from the API response
      })
      .addCase(unlikeTrack.fulfilled, (state, action) => {
        const trackId = action.payload;
        // This would typically update the track's liked status
        // The actual track update would come from the API response
      })

      // Fetch My Playlists
      .addCase(fetchMyPlaylists.pending, (state) => {
        state.isLoadingPlaylists = true;
        state.playlistsError = null;
      })
      .addCase(fetchMyPlaylists.fulfilled, (state, action) => {
        state.isLoadingPlaylists = false;
        state.myPlaylists = action.payload;
        state.libraryStats.totalPlaylists = action.payload.length;
      })
      .addCase(fetchMyPlaylists.rejected, (state, action) => {
        state.isLoadingPlaylists = false;
        state.playlistsError = action.payload;
      })

      // Fetch Liked Playlists
      .addCase(fetchLikedPlaylists.pending, (state) => {
        state.isLoadingPlaylists = true;
        state.playlistsError = null;
      })
      .addCase(fetchLikedPlaylists.fulfilled, (state, action) => {
        state.isLoadingPlaylists = false;
        state.likedPlaylists = action.payload;
      })
      .addCase(fetchLikedPlaylists.rejected, (state, action) => {
        state.isLoadingPlaylists = false;
        state.playlistsError = action.payload;
      })

      // Create Playlist
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.myPlaylists.unshift(action.payload);
        state.libraryStats.totalPlaylists += 1;
      })

      // Like/Unlike Playlist
      .addCase(likePlaylist.fulfilled, (state, action) => {
        // Update playlist liked status
      })
      .addCase(unlikePlaylist.fulfilled, (state, action) => {
        // Update playlist liked status
      })

      // Fetch My Albums
      .addCase(fetchMyAlbums.pending, (state) => {
        state.isLoadingAlbums = true;
        state.albumsError = null;
      })
      .addCase(fetchMyAlbums.fulfilled, (state, action) => {
        state.isLoadingAlbums = false;
        state.myAlbums = action.payload;
        state.libraryStats.totalAlbums = action.payload.length;
      })
      .addCase(fetchMyAlbums.rejected, (state, action) => {
        state.isLoadingAlbums = false;
        state.albumsError = action.payload;
      })

      // Fetch Followed Artists
      .addCase(fetchFollowedArtists.pending, (state) => {
        state.isLoadingArtists = true;
        state.artistsError = null;
      })
      .addCase(fetchFollowedArtists.fulfilled, (state, action) => {
        state.isLoadingArtists = false;
        state.followedArtists = action.payload;
        state.libraryStats.totalArtists = action.payload.length;
      })
      .addCase(fetchFollowedArtists.rejected, (state, action) => {
        state.isLoadingArtists = false;
        state.artistsError = action.payload;
      })

      // Follow/Unfollow Artist
      .addCase(followArtist.fulfilled, (state, action) => {
        // Update artist followed status
      })
      .addCase(unfollowArtist.fulfilled, (state, action) => {
        // Update artist followed status
      })

      // Download/Remove Download
      .addCase(downloadTrack.fulfilled, (state, action) => {
        // Update track download status
      })
      .addCase(removeDownload.fulfilled, (state, action) => {
        // Update track download status
      });
  },
});

export const {
  setTracksFilter,
  setPlaylistsFilter,
  setAlbumsFilter,
  setArtistsFilter,
  clearTracksError,
  clearPlaylistsError,
  clearAlbumsError,
  clearArtistsError,
  updateLibraryStats,
  addToLikedTracks,
  removeFromLikedTracks,
  addToDownloadedTracks,
  removeFromDownloadedTracks,
  addToMyPlaylists,
  removeFromMyPlaylists,
  addToFollowedArtists,
  removeFromFollowedArtists,
} = librarySlice.actions;

export default librarySlice.reducer;
