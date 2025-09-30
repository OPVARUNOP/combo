const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.client = null;
    this.isRedisAvailable = false;

    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: null,
        lazyConnect: true
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error.message);
        this.isRedisAvailable = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isRedisAvailable = true;
      });

      this.client.on('ready', () => {
        this.isRedisAvailable = true;
      });

      // Test connection
      this.client.connect().catch(() => {
        console.log('⚠️ Redis not available, running without cache');
        this.isRedisAvailable = false;
      });

    } catch (error) {
      console.log('⚠️ Redis not available, running without cache');
      this.isRedisAvailable = false;
    }

    // Default cache TTL (Time To Live)
    this.DEFAULT_TTL = 3600; // 1 hour
    this.SHORT_TTL = 300; // 5 minutes
    this.LONG_TTL = 86400; // 24 hours
  }

  async connect() {
    if (!this.isRedisAvailable || !this.client) return;

    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached data or null
   */
  async get(key) {
    if (!this.isRedisAvailable || !this.client) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, data, ttl = this.DEFAULT_TTL) {
    if (!this.isRedisAvailable || !this.client) return false;

    try {
      const serializedData = JSON.stringify(data);
      await this.client.setex(key, ttl, serializedData);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key) {
    if (!this.isRedisAvailable || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    if (!this.isRedisAvailable || !this.client) return false;

    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return false;
    }
  }

  /**
   * Generate cache key
   * @param {string} endpoint - API endpoint
   * @param {object} params - Request parameters
   * @returns {string} - Cache key
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    const paramString = JSON.stringify(sortedParams);
    return `combo:${endpoint}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Cache wrapper for API functions
   * @param {Function} fn - Function to cache
   * @param {string} endpoint - API endpoint
   * @param {object} params - Request parameters
   * @param {number} ttl - Cache TTL
   * @returns {Promise<any>} - Cached or fresh data
   */
  async cached(fn, endpoint, params = {}, ttl = this.DEFAULT_TTL) {
    if (this.isRedisAvailable && this.client) {
      const key = this.generateKey(endpoint, params);

      // Try to get from cache first
      const cachedData = await this.get(key);
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }

      // Cache miss - execute function and cache result
      console.log(`Cache miss for ${endpoint} - fetching fresh data`);
      try {
        const freshData = await fn();

        // Only cache successful responses
        if (freshData && !freshData.error) {
          await this.set(key, { ...freshData, cached: true, cachedAt: new Date().toISOString() }, ttl);
        }

        return freshData;
      } catch (error) {
        console.error(`Error executing cached function for ${endpoint}:`, error.message);
        throw error;
      }
    } else {
      // Redis not available, just execute the function
      console.log(`Redis not available, executing ${endpoint} without cache`);
      return await fn();
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Cache key pattern
   * @returns {Promise<number>} - Number of keys deleted
   */
  async invalidatePattern(pattern) {
    if (!this.isRedisAvailable || !this.client) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Cache invalidation error:', error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} - Cache stats
   */
  async getStats() {
    if (!this.isRedisAvailable || !this.client) {
      return { connected: false, message: 'Redis not available' };
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');

      return {
        memory: info,
        keyspace: keyspace,
        connected: this.client.status === 'ready',
        redisAvailable: this.isRedisAvailable
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return { error: error.message, connected: false };
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
