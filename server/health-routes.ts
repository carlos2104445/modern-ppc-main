import type { Express, Request, Response } from "express";
import { asyncHandler } from "./error-handler";
import { storage } from "./storage";
import redisClient from "./redis";

export function registerHealthRoutes(app: Express) {
  app.get(
    "/health",
    asyncHandler(async (_req: Request, res: Response) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    })
  );

  app.get(
    "/ready",
    asyncHandler(async (_req: Request, res: Response) => {
      const checks: Record<string, { status: string; message?: string; latency?: number }> = {};

      try {
        const dbStart = Date.now();
        await storage.getUser("health-check-test");
        checks.database = {
          status: "ok",
          latency: Date.now() - dbStart,
        };
      } catch (error) {
        checks.database = {
          status: "error",
          message: error instanceof Error ? error.message : "Database connection failed",
        };
      }

      try {
        const redisStart = Date.now();
        await redisClient.ping();
        checks.redis = {
          status: "ok",
          latency: Date.now() - redisStart,
        };
      } catch (error) {
        checks.redis = {
          status: "error",
          message: error instanceof Error ? error.message : "Redis connection failed",
        };
      }

      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      };

      checks.memory = {
        status: memoryUsageMB.heapUsed < 1024 ? "ok" : "warning",
        message: `Heap used: ${memoryUsageMB.heapUsed}MB / ${memoryUsageMB.heapTotal}MB`,
      };

      const hasErrors = Object.values(checks).some((check) => check.status === "error");
      const overallStatus = hasErrors ? "error" : "ok";

      res.status(hasErrors ? 503 : 200).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
        memory: memoryUsageMB,
      });
    })
  );

  app.get(
    "/healthz",
    asyncHandler(async (_req: Request, res: Response) => {
      res.status(200).json({ status: "alive" });
    })
  );

  app.get(
    "/readyz",
    asyncHandler(async (_req: Request, res: Response) => {
      try {
        await redisClient.ping();
        res.status(200).json({ status: "ready" });
      } catch (error) {
        res.status(503).json({
          status: "not ready",
          error: error instanceof Error ? error.message : "Service not ready",
        });
      }
    })
  );
}
