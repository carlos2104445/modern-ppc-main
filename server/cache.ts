import { Redis } from "ioredis";
import NodeCache from "node-cache";
import { logger } from "./logger";

const l1Cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for performance
  maxKeys: 1000, // Limit to 1000 keys
});

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  useL1?: boolean; // Use L1 cache (default: true)
  useL2?: boolean; // Use L2 cache (default: true)
}

export class CacheService {
  /**
   * Get value from cache (checks L1 first, then L2)
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { useL1 = true, useL2 = true } = options;

    try {
      if (useL1) {
        const l1Value = l1Cache.get<T>(key);
        if (l1Value !== undefined) {
          logger.debug("Cache hit (L1)", { key });
          return l1Value;
        }
      }

      if (useL2) {
        const l2Value = await redis.get(key);
        if (l2Value) {
          logger.debug("Cache hit (L2)", { key });
          const parsed = JSON.parse(l2Value) as T;

          if (useL1) {
            l1Cache.set(key, parsed);
          }

          return parsed;
        }
      }

      logger.debug("Cache miss", { key });
      return null;
    } catch (error) {
      logger.error("Cache get error", { key, error });
      return null;
    }
  }

  /**
   * Set value in cache (stores in both L1 and L2)
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, useL1 = true, useL2 = true } = options;

    try {
      if (useL1) {
        l1Cache.set(key, value, ttl);
      }

      if (useL2) {
        const serialized = JSON.stringify(value);
        await redis.setex(key, ttl, serialized);
      }

      logger.debug("Cache set", { key, ttl });
    } catch (error) {
      logger.error("Cache set error", { key, error });
    }
  }

  /**
   * Delete value from cache (removes from both L1 and L2)
   */
  async delete(key: string): Promise<void> {
    try {
      l1Cache.del(key);
      await redis.del(key);
      logger.debug("Cache deleted", { key });
    } catch (error) {
      logger.error("Cache delete error", { key, error });
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const l1Keys = l1Cache.keys();
      const matchingL1Keys = l1Keys.filter((key) =>
        new RegExp(pattern.replace("*", ".*")).test(key)
      );
      l1Cache.del(matchingL1Keys);

      const l2Keys = await redis.keys(pattern);
      if (l2Keys.length > 0) {
        await redis.del(...l2Keys);
      }

      logger.debug("Cache pattern deleted", {
        pattern,
        count: matchingL1Keys.length + l2Keys.length,
      });
    } catch (error) {
      logger.error("Cache delete pattern error", { pattern, error });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      l1Cache.flushAll();
      await redis.flushdb();
      logger.info("Cache cleared");
    } catch (error) {
      logger.error("Cache clear error", { error });
    }
  }

  /**
   * Get or set cache (fetch from source if not in cache)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();

    await this.set(key, value, options);

    return value;
  }

  /**
   * Warm cache with data
   */
  async warm(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      for (const entry of entries) {
        const { key, value, ttl = 300 } = entry;

        l1Cache.set(key, value, ttl);

        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttl, serialized);
      }

      await pipeline.exec();
      logger.info("Cache warmed", { count: entries.length });
    } catch (error) {
      logger.error("Cache warm error", { error });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      l1: {
        keys: l1Cache.keys().length,
        hits: l1Cache.getStats().hits,
        misses: l1Cache.getStats().misses,
        ksize: l1Cache.getStats().ksize,
        vsize: l1Cache.getStats().vsize,
      },
    };
  }

  /**
   * Invalidate cache for a specific entity
   */
  async invalidateEntity(entityType: string, entityId: string): Promise<void> {
    await this.deletePattern(`${entityType}:${entityId}:*`);
    await this.deletePattern(`${entityType}:list:*`);
  }

  /**
   * Invalidate cache for a user
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.deletePattern(`user:${userId}:*`);
    await this.deletePattern(`users:*`);
  }

  /**
   * Invalidate cache for a campaign
   */
  async invalidateCampaign(campaignId: string): Promise<void> {
    await this.deletePattern(`campaign:${campaignId}:*`);
    await this.deletePattern(`campaigns:*`);
  }
}

export const cacheService = new CacheService();

export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userCampaigns: (userId: string, page: number = 1) => `user:${userId}:campaigns:${page}`,
  campaign: (campaignId: string) => `campaign:${campaignId}`,
  campaignStats: (campaignId: string) => `campaign:${campaignId}:stats`,
  adViews: (userId: string, date: string) => `user:${userId}:adviews:${date}`,
  leaderboard: (period: string) => `leaderboard:${period}`,
  platformStats: () => `platform:stats`,
  adminCampaigns: (page: number = 1) => `admin:campaigns:${page}`,
};
