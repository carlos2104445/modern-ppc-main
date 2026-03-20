import redis from "./redis";
import { createLogger } from "./logger";

const logger = createLogger("CacheService");

export class CacheService {
  private prefix: string;
  private defaultTTL: number;

  constructor(prefix: string = "app", defaultTTL: number = 3600) {
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for get operation", { key });
        return null;
      }

      const value = await redis.get(this.getKey(key));
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("Cache get error", error, { key });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for set operation", { key });
        return false;
      }

      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await redis.setex(this.getKey(key), ttl, serialized);
      } else {
        await redis.set(this.getKey(key), serialized);
      }
      return true;
    } catch (error) {
      logger.error("Cache set error", error, { key });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for del operation", { key });
        return false;
      }

      await redis.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error("Cache del error", error, { key });
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for delPattern operation", { pattern });
        return 0;
      }

      const keys = await redis.keys(this.getKey(pattern));
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error("Cache delPattern error", error, { pattern });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (redis.status !== "ready") {
        return false;
      }

      const result = await redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error("Cache exists error", error, { key });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      if (redis.status !== "ready") {
        return -1;
      }

      return await redis.ttl(this.getKey(key));
    } catch (error) {
      logger.error("Cache ttl error", error, { key });
      return -1;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for increment operation", { key });
        return 0;
      }

      return await redis.incrby(this.getKey(key), amount);
    } catch (error) {
      logger.error("Cache increment error", error, { key });
      return 0;
    }
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for decrement operation", { key });
        return 0;
      }

      return await redis.decrby(this.getKey(key), amount);
    } catch (error) {
      logger.error("Cache decrement error", error, { key });
      return 0;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T | null> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetcher();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error("Cache getOrSet fetcher error", error, { key });
      return null;
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    for (const tag of tags) {
      const deleted = await this.delPattern(`*:tag:${tag}:*`);
      totalDeleted += deleted;
    }
    return totalDeleted;
  }

  async delete(key: string): Promise<boolean> {
    return this.del(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.delPattern(pattern);
  }

  async clear(): Promise<boolean> {
    try {
      if (redis.status !== "ready") {
        logger.warn("Redis not available for clear operation");
        return false;
      }

      const keys = await redis.keys(`${this.prefix}:*`);
      if (keys.length === 0) return true;

      await redis.del(...keys);
      return true;
    } catch (error) {
      logger.error("Cache clear error", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (redis.status === "ready") {
        await redis.quit();
      }
    } catch (error) {
      logger.error("Cache disconnect error", error);
    }
  }
}

export const cacheService = new CacheService();
export const userCache = new CacheService("user", 1800);
export const campaignCache = new CacheService("campaign", 900);
export const adViewCache = new CacheService("adview", 300);
