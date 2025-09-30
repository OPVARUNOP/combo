import api, { musicAPI } from './api';

export const searchService = {
  async searchMusic(query, options = {}) {
    try {
      const { filters = {}, page = 1, limit = 20, type = 'track' } = options;

      const params = {
        q: query,
        offset: (page - 1) * limit,
        limit,
        type,
        ...filters,
      };

      const response = await musicAPI.search(query, params);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },

  async getSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // For now, return empty suggestions since backend doesn't have suggestions endpoint
      // This can be enhanced later with a suggestions service
      return [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  },

  async getTrending(options = {}) {
    try {
      const response = await musicAPI.getTrending(options);
      return response.data;
    } catch (error) {
      console.error('Trending error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get trending');
    }
  },

  async getAlbums(options = {}) {
    try {
      const response = await musicAPI.getAlbums(options);
      return response.data;
    } catch (error) {
      console.error('Albums error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get albums');
    }
  },

  async getArtists(options = {}) {
    try {
      const response = await musicAPI.getArtists(options);
      return response.data;
    } catch (error) {
      console.error('Artists error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get artists');
    }
  },

  async getTrackById(trackId) {
    try {
      const response = await musicAPI.getTrackById(trackId);
      return response.data;
    } catch (error) {
      console.error('Track error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get track');
    }
  },

  async getPlaylists() {
    try {
      const response = await musicAPI.getPlaylists();
      return response.data;
    } catch (error) {
      console.error('Playlists error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get playlists');
    }
  },

  async createPlaylist(playlistData) {
    try {
      const response = await musicAPI.createPlaylist(playlistData);
      return response.data;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create playlist');
    }
  },

  async addTrackToPlaylist(playlistId, trackId) {
    try {
      const response = await musicAPI.addTrackToPlaylist(playlistId, trackId);
      return response.data;
    } catch (error) {
      console.error('Add track to playlist error:', error);
      throw new Error(error.response?.data?.message || 'Failed to add track to playlist');
    }
  },

  async removeTrackFromPlaylist(playlistId, trackId) {
    try {
      const response = await musicAPI.removeTrackFromPlaylist(playlistId, trackId);
      return response.data;
    } catch (error) {
      console.error('Remove track from playlist error:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove track from playlist');
    }
  },
};
