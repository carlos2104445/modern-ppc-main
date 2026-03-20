import promClient from "prom-client";
import type { Express, Request, Response } from "express";

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

export const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
  registers: [register],
});

export const databaseQueryDuration = new promClient.Histogram({
  name: "database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const redisOperationDuration = new promClient.Histogram({
  name: "redis_operation_duration_seconds",
  help: "Duration of Redis operations in seconds",
  labelNames: ["operation"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

export const authenticationAttempts = new promClient.Counter({
  name: "authentication_attempts_total",
  help: "Total number of authentication attempts",
  labelNames: ["result"],
  registers: [register],
});

export const campaignCreated = new promClient.Counter({
  name: "campaigns_created_total",
  help: "Total number of campaigns created",
  registers: [register],
});

export const adViewsTotal = new promClient.Counter({
  name: "ad_views_total",
  help: "Total number of ad views",
  labelNames: ["campaign_id"],
  registers: [register],
});

export const paymentProcessed = new promClient.Counter({
  name: "payments_processed_total",
  help: "Total number of payments processed",
  labelNames: ["status"],
  registers: [register],
});

export const paymentAmount = new promClient.Histogram({
  name: "payment_amount_birr",
  help: "Payment amounts in Ethiopian Birr",
  labelNames: ["type"],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000],
  registers: [register],
});

export function registerPrometheusEndpoint(app: Express) {
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });
}

export function prometheusMiddleware(req: Request, res: Response, next: Function) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
  });

  next();
}

export { register };
