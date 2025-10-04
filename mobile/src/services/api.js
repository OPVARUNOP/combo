import axios from 'axios';
import firebaseAuth from './firebaseAuth';

// Firebase Functions URL (Deployed Firebase Cloud Functions)
const PRODUCTION_BACKEND_URL = 'https://us-central1-combo-624e1.cloudfunctions.net/api';

// Development URL (for local Firebase emulator)
const DEVELOPMENT_BACKEND_URL = __DEV__
  ? 'http://localhost:5001/combo-624e1/us-central1/api'
  : PRODUCTION_BACKEND_URL;

// Use Firebase Functions for all environments
const API_BASE_URL = DEVELOPMENT_BACKEND_URL;

// Create axios instance for Firebase Functions
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
      // Get Firebase token instead of stored token
      const token = await firebaseAuth.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error adding auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
      return Promise.reject({
        error: 'Network error. Please check your connection.',
      });
    } else {
      // Other error
      console.error('Request Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
      return Promise.reject({
        error: 'Network error. Please check your connection.',
      });
    } else {
      // Other error
      console.error('Request Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  },
);

// Auth API (Firebase Functions)
export const authAPI = {
  register: (userData) => api.post('/users', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// User API (Firebase Functions)
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getUser: (userId) => api.get(`/users/${userId}`),
  searchUsers: (query) => api.get('/search', { params: { q: query, type: 'users' } }),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

// Music API (Firebase Functions)
export const musicAPI = {
  getAll: (params = {}) => api.get('/music', { params }),
  getById: (id) => api.get(`/music/${id}`),
  streamTrack: (trackId, userId) => api.post(`/tracks/${trackId}/stream`, { userId }),
  getRecommendations: (userId) => api.get(`/recommendations/${userId}`),
  getTrending: (type = 'tracks') => api.get('/trending', { params: { type } }),
};

// Playlist API (Firebase Functions)
export const playlistAPI = {
  getAll: (params = {}) => api.get('/playlists', { params }),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (playlistData) => api.post('/playlists', playlistData),
  update: (id, playlistData) => api.put(`/playlists/${id}`, playlistData),
  delete: (id) => api.delete(`/playlists/${id}`),
  getMyPlaylists: () => api.get('/users/me/playlists'),
};

// Social API (Firebase Functions)
export const socialAPI = {
  getFeed: (params = {}) => api.get('/social/feed', { params }),
  createPost: (postData) => api.post('/social/posts', postData),
  likePost: (postId) => api.post(`/social/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/social/posts/${postId}/like`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getUserFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getUserFollowing: (userId) => api.get(`/users/${userId}/following`),
  getActivityFeed: (params = {}) => api.get('/social/activity', { params }),
};

// Search API (Firebase Functions)
export const searchAPI = {
  search: (query, type = 'all') => api.get('/search', { params: { q: query, type } }),
  searchTracks: (query) => api.get('/search', { params: { q: query, type: 'tracks' } }),
  searchUsers: (query) => api.get('/search', { params: { q: query, type: 'users' } }),
};

// Analytics API (Firebase Functions)
export const analyticsAPI = {
  trackStream: (trackId, userId, duration) =>
    api.post(`/tracks/${trackId}/stream`, { userId, duration }),
  trackActivity: (activity) => api.post('/analytics/activity', activity),
};

// Export the configured axios instance
export default api;
