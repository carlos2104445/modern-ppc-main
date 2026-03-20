import { cacheService } from "../cache-service";
import redis from "../redis";

describe("Cache Service", () => {
  let isRedisAvailable = false;

  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    isRedisAvailable = redis.status === "ready";

    if (!isRedisAvailable) {
      console.log("Redis not available - running tests with graceful fallback behavior");
    }
  });

  beforeEach(async () => {
    if (isRedisAvailable) {
      await cacheService.clear();
    }
  });

  afterAll(async () => {
    await cacheService.disconnect();
  });

  describe("set and get", () => {
    it("should set and get string values", async () => {
      await cacheService.set("test-key", "test-value");
      const value = await cacheService.get("test-key");

      if (isRedisAvailable) {
        expect(value).toBe("test-value");
      } else {
        expect(value).toBeNull();
      }
    });

    it("should set and get object values", async () => {
      const obj = { name: "Test", value: 123 };
      await cacheService.set("test-obj", obj);
      const value = await cacheService.get<typeof obj>("test-obj");

      if (isRedisAvailable) {
        expect(value).toEqual(obj);
      } else {
        expect(value).toBeNull();
      }
    });

    it("should return null for non-existent keys", async () => {
      const value = await cacheService.get("non-existent");

      expect(value).toBeNull();
    });

    it("should overwrite existing values", async () => {
      await cacheService.set("test-key", "value1");
      await cacheService.set("test-key", "value2");
      const value = await cacheService.get("test-key");

      if (isRedisAvailable) {
        expect(value).toBe("value2");
      } else {
        expect(value).toBeNull();
      }
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should set value with TTL", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("ttl-key", "ttl-value", 1);
      const value = await cacheService.get("ttl-key");

      expect(value).toBe("ttl-value");
    });

    it("should expire value after TTL", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("ttl-key", "ttl-value", 1);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const value = await cacheService.get("ttl-key");
      expect(value).toBeNull();
    }, 2000);

    it("should handle TTL of 0 (no expiration)", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("no-ttl-key", "no-ttl-value", 0);
      const value = await cacheService.get("no-ttl-key");

      expect(value).toBe("no-ttl-value");
    });
  });

  describe("delete", () => {
    it("should delete existing key", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("delete-key", "delete-value");
      await cacheService.delete("delete-key");
      const value = await cacheService.get("delete-key");

      expect(value).toBeNull();
    });

    it("should not throw error when deleting non-existent key", async () => {
      await expect(cacheService.delete("non-existent")).resolves.not.toThrow();
    });
  });

  describe("clear", () => {
    it("should clear all keys", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("key1", "value1");
      await cacheService.set("key2", "value2");
      await cacheService.set("key3", "value3");

      await cacheService.clear();

      const value1 = await cacheService.get("key1");
      const value2 = await cacheService.get("key2");
      const value3 = await cacheService.get("key3");

      expect(value1).toBeNull();
      expect(value2).toBeNull();
      expect(value3).toBeNull();
    });

    it("should handle clearing empty cache", async () => {
      await expect(cacheService.clear()).resolves.not.toThrow();
    });
  });

  describe("invalidatePattern", () => {
    it("should invalidate keys matching pattern", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("user:1:profile", "profile1");
      await cacheService.set("user:1:settings", "settings1");
      await cacheService.set("user:2:profile", "profile2");

      await cacheService.invalidatePattern("user:1:*");

      const profile1 = await cacheService.get("user:1:profile");
      const settings1 = await cacheService.get("user:1:settings");
      const profile2 = await cacheService.get("user:2:profile");

      expect(profile1).toBeNull();
      expect(settings1).toBeNull();
      expect(profile2).toBe("profile2");
    });

    it("should handle pattern with no matches", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("key1", "value1");

      await expect(cacheService.invalidatePattern("nomatch:*")).resolves.not.toThrow();

      const value1 = await cacheService.get("key1");
      expect(value1).toBe("value1");
    });
  });

  describe("error handling", () => {
    it("should handle gracefully when Redis is unavailable", async () => {
      await expect(cacheService.set("test", "value")).resolves.not.toThrow();
      await expect(cacheService.get("test")).resolves.not.toThrow();
      await expect(cacheService.delete("test")).resolves.not.toThrow();
      await expect(cacheService.clear()).resolves.not.toThrow();
    });
  });

  describe("concurrent operations", () => {
    it("should handle concurrent sets", async () => {
      if (!isRedisAvailable) {
        return;
      }

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(cacheService.set(`concurrent-${i}`, `value-${i}`));
      }

      await Promise.all(promises);

      const values = await Promise.all(
        Array.from({ length: 10 }, (_, i) => cacheService.get(`concurrent-${i}`))
      );

      values.forEach((value, i) => {
        expect(value).toBe(`value-${i}`);
      });
    });

    it("should handle concurrent gets", async () => {
      if (!isRedisAvailable) {
        return;
      }

      await cacheService.set("concurrent-get", "test-value");

      const promises = Array.from({ length: 10 }, () => cacheService.get("concurrent-get"));

      const values = await Promise.all(promises);

      values.forEach((value) => {
        expect(value).toBe("test-value");
      });
    });
  });
});
