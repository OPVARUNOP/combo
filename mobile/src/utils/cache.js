import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple in-memory cache for frequently accessed data
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of items
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  set(key, value, customTtl = null) {
    const ttl = customTtl || this.ttl;
    const expiry = Date.now() + ttl;

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Persistent cache using AsyncStorage
class PersistentCache {
  constructor(namespace = 'combo_cache') {
    this.namespace = namespace;
  }

  async set(key, value, ttl = 24 * 60 * 60 * 1000) {
    // 24 hours default
    try {
      const item = {
        value: JSON.stringify(value),
        expiry: Date.now() + ttl,
        created: Date.now(),
      };

      await AsyncStorage.setItem(`${this.namespace}_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting persistent cache:', error);
    }
  }

  async get(key) {
    try {
      const itemStr = await AsyncStorage.getItem(`${this.namespace}_${key}`);

      if (!itemStr) {
        return null;
      }

      const item = JSON.parse(itemStr);

      if (Date.now() > item.expiry) {
        await this.delete(key);
        return null;
      }

      return JSON.parse(item.value);
    } catch (error) {
      console.error('Error getting persistent cache:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      await AsyncStorage.removeItem(`${this.namespace}_${key}`);
    } catch (error) {
      console.error('Error deleting persistent cache:', error);
    }
  }

  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(`${this.namespace}_`));

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing persistent cache:', error);
    }
  }

  async size() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter((key) => key.startsWith(`${this.namespace}_`)).length;
    } catch (error) {
      console.error('Error getting persistent cache size:', error);
      return 0;
    }
  }
}

// Image cache for artwork and avatars
class ImageCache {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.persistentCache = new PersistentCache('combo_images');
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB
    this.currentMemorySize = 0;
  }

  async setImage(key, imageData, options = {}) {
    const { persist = false, quality = 0.8 } = options;

    try {
      // Store in memory cache
      this.memoryCache.set(key, imageData);

      // Store in persistent cache if requested
      if (persist) {
        await this.persistentCache.set(key, imageData, 7 * 24 * 60 * 60 * 1000); // 7 days
      }

      // Update memory size estimate
      this.currentMemorySize += this.estimateSize(imageData);

      // Clean up if memory usage is too high
      if (this.currentMemorySize > this.maxMemorySize) {
        await this.cleanup();
      }
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  async getImage(key) {
    // Try memory cache first
    let imageData = this.memoryCache.get(key);

    if (!imageData) {
      // Try persistent cache
      try {
        imageData = await this.persistentCache.get(key);
        if (imageData) {
          // Restore to memory cache for faster future access
          this.memoryCache.set(key, imageData);
        }
      } catch (error) {
        console.error('Error getting persistent image:', error);
      }
    }

    return imageData;
  }

  estimateSize(data) {
    // Rough estimation of data size in bytes
    return JSON.stringify(data).length * 2;
  }

  async cleanup() {
    // Clear old items from memory cache
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Clear expired items from persistent cache
    await this.persistentCache.clear();
  }
}

// API response cache
class ApiCache {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.persistentCache = new PersistentCache('combo_api');
  }

  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  async get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);

    // Try memory cache first
    let data = this.memoryCache.get(key);

    if (!data) {
      // Try persistent cache
      data = await this.persistentCache.get(key);

      if (data) {
        // Restore to memory cache
        this.memoryCache.set(key, data);
      }
    }

    return data;
  }

  async set(endpoint, params = {}, data, ttl = 5 * 60 * 1000) {
    // 5 minutes default
    const key = this.generateKey(endpoint, params);

    this.memoryCache.set(key, data, ttl);
    await this.persistentCache.set(key, data, ttl);
  }

  async invalidate(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);

    this.memoryCache.delete(key);
    await this.persistentCache.delete(key);
  }

  async clear() {
    this.memoryCache.clear();
    await this.persistentCache.clear();
  }
}

// Export singleton instances
export const memoryCache = new MemoryCache();
export const persistentCache = new PersistentCache();
export const imageCache = new ImageCache();
export const apiCache = new ApiCache();

// Utility function to cache API calls
export const withCache = async (key, fetcher, options = {}) => {
  const { ttl = 5 * 60 * 1000, forceRefresh = false } = options;

  if (!forceRefresh) {
    const cached = await apiCache.get(key);
    if (cached) {
      return cached;
    }
  }

  const data = await fetcher();
  await apiCache.set(key, data, ttl);

  return data;
};
