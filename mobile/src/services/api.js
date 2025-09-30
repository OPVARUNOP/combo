import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production backend URL (Deployed to Google Cloud Run)
const PRODUCTION_BACKEND_URL = 'https://combo-backend-531640636721.us-central1.run.app/api';

// Development backend URL
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3001/api';

// Use production URL for production builds, development for dev builds
const API_BASE_URL = __DEV__ ? DEVELOPMENT_BACKEND_URL : PRODUCTION_BACKEND_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          refreshToken,
        });

        const { accessToken } = response.data;

        // Store the new token
        await AsyncStorage.setItem('userToken', accessToken);

        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, log out the user
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        // You might want to redirect to login screen here
        console.error('Token refresh failed:', error);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (email, password) => api.post('/users/login', { email, password }),
  logout: () => api.post('/users/logout'),
};

// Music API
export const musicAPI = {
  // Get all songs with optional search/filter
  getAll: (params = {}) => api.get('/music', { params }),

  // Get song by ID
  getById: (id) => api.get(`/music/${id}`),

  // Create new song
  create: (songData) => api.post('/music', songData),

  // Update song
  update: (id, songData) => api.put(`/music/${id}`, songData),

  // Delete song
  delete: (id) => api.delete(`/music/${id}`),

  // Search songs
  search: (query) => api.get('/music', { params: { search: query } }),

  // Get songs by artist
  getByArtist: (artist) => api.get('/music', { params: { artist } }),

  // Get songs by genre
  getByGenre: (genre) => api.get('/music', { params: { genre } }),
};

// Playlist API
export const playlistAPI = {
  // Get all playlists
  getAll: () => api.get('/playlists'),

  // Get playlist by ID
  getById: (id) => api.get(`/playlists/${id}`),

  // Create new playlist
  create: (playlistData) => api.post('/playlists', playlistData),

  // Update playlist
  update: (id, playlistData) => api.put(`/playlists/${id}`, playlistData),

  // Delete playlist
  delete: (id) => api.delete(`/playlists/${id}`),

  // Add song to playlist
  addSong: (playlistId, songId) =>
    api.post(`/playlists/${playlistId}/songs`, { songId }),

  // Remove song from playlist
  removeSong: (playlistId, songId) =>
    api.delete(`/playlists/${playlistId}/songs/${songId}`),
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get('/users/me'),

  // Update user profile
  updateProfile: (data) => api.put('/users/me', data),

  // Get user playlists
  getPlaylists: () => api.get('/users/me/playlists'),
};

// Export the configured axios instance
export default api;
