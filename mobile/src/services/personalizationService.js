import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

// Mock data for demonstration - replace with real API calls
const MOCK_RECOMMENDATIONS = {
  forYou: [
    {
      id: '1',
      title: 'Discover Mix',
      description: 'Based on your recent listening',
      type: 'playlist',
      tracks: 25,
      artwork: null,
    },
    {
      id: '2',
      title: 'Chill Vibes',
      description: 'Perfect for relaxation',
      type: 'playlist',
      tracks: 30,
      artwork: null,
    },
  ],
  trending: [
    {
      id: '1',
      title: 'Trending Now',
      description: 'Most popular tracks this week',
      type: 'playlist',
      tracks: 50,
      artwork: null,
    },
  ],
  newReleases: [
    {
      id: '1',
      title: 'New Releases',
      description: 'Latest music from your favorite artists',
      type: 'playlist',
      tracks: 15,
      artwork: null,
    },
  ],
};

class PersonalizationService {
  constructor() {
    this.baseURL = '/personalization';
    this.localStorageKey = '@combo_personalization';
  }

  // User Preferences Management
  async getUserPreferences(userId) {
    try {
      // Try to fetch from API first
      const response = await api.get(`${this.baseURL}/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.log('API not available, using local preferences');
      // Fallback to local storage
      const localPrefs = await this.getLocalPreferences();
      return localPrefs;
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      // Try to update via API
      const response = await api.post(`${this.baseURL}/preferences/${userId}`, preferences);
      // Also update local storage
      await this.saveLocalPreferences({
        ...preferences,
        lastUpdated: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.log('API not available, saving locally only');
      // Fallback to local storage only
      await this.saveLocalPreferences({
        ...preferences,
        lastUpdated: new Date().toISOString(),
      });
      return preferences;
    }
  }

  async getLocalPreferences() {
    try {
      const stored = await AsyncStorage.getItem(this.localStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local preferences:', error);
    }

    // Return default preferences
    return {
      favoriteGenres: [],
      preferredArtists: [],
      listeningTime: {
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
      },
      moodPreferences: [],
      languagePreferences: [],
      explicitContent: false,
      autoplayEnabled: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  async saveLocalPreferences(preferences) {
    try {
      await AsyncStorage.setItem(this.localStorageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving local preferences:', error);
    }
  }

  // Recommendation Engine
  async getRecommendations(userId, type = 'general', limit = 20) {
    try {
      // Try to fetch from API
      const response = await api.get(`${this.baseURL}/recommendations/${userId}`, {
        params: { type, limit },
      });
      return response.data;
    } catch (error) {
      console.log('API not available, using mock recommendations');
      // Fallback to mock data
      return {
        type,
        data: this.getMockRecommendations(type, limit),
        source: 'mock',
      };
    }
  }

  getMockRecommendations(type, limit) {
    switch (type) {
      case 'forYou':
        return MOCK_RECOMMENDATIONS.forYou.slice(0, limit);
      case 'trending':
        return MOCK_RECOMMENDATIONS.trending.slice(0, limit);
      case 'newReleases':
        return MOCK_RECOMMENDATIONS.newReleases.slice(0, limit);
      case 'similarArtists':
        return [
          {
            id: '1',
            name: 'Similar Artist 1',
            followers: '1.2M',
            genres: ['Pop', 'Rock'],
          },
        ];
      case 'moodBased':
        return [
          {
            id: '1',
            mood: 'Energetic',
            tracks: 45,
            description: 'High-energy tracks to get you moving',
          },
        ];
      case 'discovery':
        return [
          {
            id: '1',
            title: 'Discovery Mix',
            description: 'New artists and genres for you',
            tracks: 30,
          },
        ];
      default:
        return MOCK_RECOMMENDATIONS.forYou.slice(0, limit);
    }
  }

  // Activity Tracking
  async trackActivity(userId, activity) {
    try {
      // Try to send to API
      await api.post(`${this.baseURL}/activity/${userId}`, {
        ...activity,
        timestamp: new Date().toISOString(),
      });

      // Also store locally for offline capability
      await this.addLocalActivity(activity);
    } catch (error) {
      console.log('API not available, storing activity locally');
      // Fallback to local storage only
      await this.addLocalActivity(activity);
    }
  }

  async addLocalActivity(activity) {
    try {
      const activities = await this.getLocalActivities();
      activities.unshift({
        ...activity,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      });

      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.pop();
      }

      await AsyncStorage.setItem('@combo_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error storing local activity:', error);
    }
  }

  async getLocalActivities() {
    try {
      const stored = await AsyncStorage.getItem('@combo_activities');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading local activities:', error);
      return [];
    }
  }

  // Listening History
  async addToListeningHistory(userId, track) {
    try {
      await api.post(`${this.baseURL}/history/${userId}`, {
        trackId: track.id,
        timestamp: new Date().toISOString(),
        playDuration: track.duration || 0,
      });
    } catch (error) {
      // Silent failure for history tracking
      console.log('Could not update listening history');
    }
  }

  // AI-powered Recommendations (Mock implementation)
  async getPersonalizedRecommendations(userId, context = {}) {
    const preferences = await this.getUserPreferences(userId);
    const history = await this.getLocalActivities();

    // Simple recommendation logic based on preferences and history
    const recommendations = [];

    // Genre-based recommendations
    if (preferences.favoriteGenres.length > 0) {
      recommendations.push({
        type: 'genre_based',
        title: `${preferences.favoriteGenres[0]} Mix`,
        description: `More ${preferences.favoriteGenres[0]} music for you`,
        tracks: 20,
      });
    }

    // Time-based recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      recommendations.push({
        type: 'morning',
        title: 'Morning Energy',
        description: 'Start your day with uplifting music',
        tracks: 15,
      });
    } else if (currentHour >= 18 && currentHour < 22) {
      recommendations.push({
        type: 'evening',
        title: 'Evening Unwind',
        description: 'Relaxing music for the evening',
        tracks: 18,
      });
    }

    // Mood-based recommendations
    if (preferences.moodPreferences.includes('chill')) {
      recommendations.push({
        type: 'mood',
        title: 'Chill Vibes',
        description: 'Calm and relaxing tracks',
        tracks: 25,
      });
    }

    return recommendations;
  }

  // Analytics and Insights
  async getListeningInsights(userId, period = 'week') {
    try {
      const response = await api.get(`${this.baseURL}/insights/${userId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      // Return mock insights
      return {
        totalListeningTime: '12h 34m',
        topGenre: 'Pop',
        topArtist: 'Taylor Swift',
        favoriteTimeOfDay: 'Evening',
        streakDays: 7,
        newDiscoveries: 15,
      };
    }
  }

  // Preference Learning
  async updatePreferencesFromActivity(userId, activities) {
    // Analyze recent activities to update preferences
    const genreCount = {};
    const artistCount = {};

    activities.forEach((activity) => {
      if (activity.type === 'track_play' && activity.track) {
        const { genre, artist } = activity.track;

        if (genre) {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        }

        if (artist) {
          artistCount[artist] = (artistCount[artist] || 0) + 1;
        }
      }
    });

    // Extract top preferences
    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    const topArtists = Object.entries(artistCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([artist]) => artist);

    return {
      favoriteGenres: topGenres,
      preferredArtists: topArtists,
    };
  }
}

export const personalizationService = new PersonalizationService();
