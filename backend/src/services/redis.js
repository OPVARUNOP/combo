const { createClient } = require('redis');
const config = require('../config/config');
const logger = require('../config/logger');

class RedisClient {
  constructor() {
    this.client = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password,
    });

    this.client.on('error', (err) => {
      logger.error(`Redis error: ${err}`);
    });
  }

  async connect() {
    try {
      await this.client.connect();
      logger.info('Redis client connected');
    } catch (err) {
      logger.error('Redis connection error:', err);
      throw err;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.client.set(key, strValue, {
        EX: ttl,
      });
      return true;
    } catch (err) {
      logger.error('Redis set error:', err);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (err) {
      logger.error('Redis get error:', err);
      return null;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      logger.error('Redis delete error:', err);
      return false;
    }
  }

  async increment(key) {
    try {
      return await this.client.incr(key);
    } catch (err) {
      logger.error('Redis increment error:', err);
      return null;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (err) {
      logger.error('Redis expire error:', err);
      return false;
    }
  }
}

const redisClient = new RedisClient();

module.exports = { redisClient };
