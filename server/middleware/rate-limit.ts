import type { Request, Response, NextFunction } from "express";
import redis from "../redis";
import { RateLimitErrors } from "../errors";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix, skipSuccessfulRequests = false } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.ip || req.connection.remoteAddress || "unknown";
      const key = `${keyPrefix}:${identifier}`;

      if (redis.status !== "ready") {
        console.warn("Redis not available, skipping rate limit");
        return next();
      }

      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= maxRequests) {
        const retryAfter = Math.ceil(windowMs / 1000);
        throw RateLimitErrors.exceeded(retryAfter);
      }

      if (skipSuccessfulRequests) {
        const originalSend = res.json.bind(res);
        res.json = function (body: any) {
          if (res.statusCode < 400) {
            incrementCounter(key, windowMs);
          }
          return originalSend(body);
        };
        next();
      } else {
        await incrementCounter(key, windowMs);
        next();
      }
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        next(error);
      } else {
        console.error("Rate limit error:", error);
        next();
      }
    }
  };
}

async function incrementCounter(key: string, windowMs: number) {
  try {
    const multi = redis.multi();
    multi.incr(key);
    multi.pexpire(key, windowMs);
    await multi.exec();
  } catch (error) {
    console.error("Failed to increment rate limit counter:", error);
  }
}

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  keyPrefix: "rate-limit:api",
});

export const adViewRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: "rate-limit:ad-view",
  skipSuccessfulRequests: true,
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: "rate-limit:auth",
});

export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyPrefix: "rate-limit:payment",
});

export const campaignRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  keyPrefix: "rate-limit:campaign",
});

