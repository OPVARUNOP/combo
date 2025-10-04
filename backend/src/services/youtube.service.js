const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const { redisClient } = require('./redis');

const YOUTUBE_API_URL = process.env.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';

/**
 * Search for videos on YouTube
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - List of videos
 */
const searchVideos = async (query, options = {}) => {
  const { maxResults = 10, pageToken = '' } = options;
  const cacheKey = `youtube:search:${query}:${maxResults}:${pageToken}`;

  // Try to get from cache first
  const cachedResults = await redisClient.get(cacheKey);
  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  try {
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults,
      key: process.env.YOUTUBE_API_KEY || config.apis?.youtube?.key,
      pageToken,
    };

    if (!params.key) {
      throw new Error('YouTube API key is required');
    }

    const response = await axios.get(`${YOUTUBE_API_URL}/search`, { params });

    // Extract video IDs for getting more details
    const videoIds = response.data.items.map((item) => item.id.videoId);

    // Get video details
    const videos = await getVideosDetails(videoIds);

    // Cache the results for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(videos), 3600);

    return videos;
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    throw new Error('Failed to search YouTube videos');
  }
};

/**
 * Get details for multiple videos
 * @param {Array<string>} videoIds - Array of video IDs
 * @returns {Promise<Array>} - Video details
 */
const getVideosDetails = async (videoIds) => {
  try {
    const params = {
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      key: config.apis.youtube.key,
    };

    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, { params });

    return response.data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      duration: parseDuration(item.contentDetails.duration),
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      category: item.snippet.categoryId,
      tags: item.snippet.tags || [],
    }));
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get video details by ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video details
 */
const getVideoDetails = async (videoId) => {
  const cacheKey = `youtube:video:${videoId}`;

  // Try to get from cache first
  const cachedVideo = await redisClient.get(cacheKey);
  if (cachedVideo) {
    return JSON.parse(cachedVideo);
  }

  try {
    const videos = await getVideosDetails([videoId]);
    const video = videos[0];

    if (video) {
      // Cache the video details for 24 hours
      await redisClient.set(cacheKey, JSON.stringify(video), 86400);
    }

    return video || null;
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get streaming URL for a video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Streaming URL
 */
const getStreamUrl = async (videoId) => {
  // In a real app, you would use youtube-dl or similar library to get the stream URL
  // This is a simplified example
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Get trending videos
 * @param {Object} options - Options
 * @returns {Promise<Array>} - List of trending videos
 */
const getTrendingVideos = async (options = {}) => {
  const {
    regionCode = 'US',
    maxResults = 10,
    category = '10', // Music category
  } = options;

  const cacheKey = `youtube:trending:${regionCode}:${category}:${maxResults}`;

  // Try to get from cache first
  const cachedResults = await redisClient.get(cacheKey);
  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  try {
    const params = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode,
      videoCategoryId: category,
      maxResults,
      key: config.apis.youtube.key,
    };

    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, { params });

    const videos = response.data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      duration: parseDuration(item.contentDetails.duration),
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      category: item.snippet.categoryId,
      tags: item.snippet.tags || [],
    }));

    // Cache the results for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(videos), 3600);

    return videos;
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch trending videos');
  }
};

/**
 * Parse ISO 8601 duration format to seconds
 * @param {string} duration - ISO 8601 duration string (e.g., PT1H2M3S)
 * @returns {number} - Duration in seconds
 */
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
};

module.exports = {
  searchVideos,
  getVideoDetails,
  getStreamUrl,
  getTrendingVideos,
};
