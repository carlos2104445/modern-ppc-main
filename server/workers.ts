import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { logger } from "./logger";
import { storage } from "./storage";
import { cacheService, CacheKeys } from "./cache";
import type {
  EmailJobData,
  ReportJobData,
  PaymentReconciliationJobData,
  CacheWarmingJobData,
} from "./queue";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    const { to, subject, html, from } = job.data;

    logger.info("Processing email job", { jobId: job.id, to, subject });

    try {
      logger.info("Email sent successfully", { to, subject });

      return { success: true, to, subject };
    } catch (error) {
      logger.error("Failed to send email", { error, to, subject });
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 60000,
    },
  }
);

export const reportWorker = new Worker<ReportJobData>(
  "report",
  async (job: Job<ReportJobData>) => {
    const { userId, reportType, startDate, endDate, format } = job.data;

    logger.info("Processing report job", { jobId: job.id, userId, reportType, format });

    try {
      let data: any;

      switch (reportType) {
        case "earnings":
          data = await storage.getUserChapaPayments(userId);
          break;
        case "campaigns":
          data = await storage.getCampaignsByUserId(userId);
          break;
        case "adviews":
          data = await storage.getUserAdViews(userId);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      logger.info("Report generated successfully", {
        userId,
        reportType,
        format,
        recordCount: data.length,
      });

      return { success: true, userId, reportType, format, recordCount: data.length };
    } catch (error) {
      logger.error("Failed to generate report", { error, userId, reportType });
      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

export const paymentReconciliationWorker = new Worker<PaymentReconciliationJobData>(
  "payment-reconciliation",
  async (job: Job<PaymentReconciliationJobData>) => {
    const { startDate, endDate } = job.data;

    logger.info("Processing payment reconciliation job", { jobId: job.id, startDate, endDate });

    try {
      const payments = await storage.getPaymentsByDateRange(new Date(startDate), new Date(endDate));

      let reconciledCount = 0;
      let discrepancyCount = 0;

      for (const payment of payments) {
        if (payment.status === "success") {
          reconciledCount++;
        } else {
          discrepancyCount++;
        }
      }

      logger.info("Payment reconciliation completed", {
        startDate,
        endDate,
        totalPayments: payments.length,
        reconciledCount,
        discrepancyCount,
      });

      return {
        success: true,
        totalPayments: payments.length,
        reconciledCount,
        discrepancyCount,
      };
    } catch (error) {
      logger.error("Failed to reconcile payments", { error, startDate, endDate });
      throw error;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);

export const cacheWarmingWorker = new Worker<CacheWarmingJobData>(
  "cache-warming",
  async (job: Job<CacheWarmingJobData>) => {
    const { entityType } = job.data;

    logger.info("Processing cache warming job", { jobId: job.id, entityType });

    try {
      let warmedCount = 0;

      switch (entityType) {
        case "users": {
          const users = await storage.getAllUsers();
          for (const user of users.slice(0, 100)) {
            await cacheService.set(CacheKeys.user(user.id), user, { ttl: 3600 });
            warmedCount++;
          }
          break;
        }

        case "campaigns": {
          const campaigns = await storage.getAllAdminCampaigns();
          for (const campaign of campaigns.slice(0, 100)) {
            await cacheService.set(CacheKeys.campaign(campaign.id), campaign, { ttl: 3600 });
            warmedCount++;
          }
          break;
        }

        case "stats": {
          const platformStats = await storage.getPlatformStats();
          await cacheService.set(CacheKeys.platformStats(), platformStats, { ttl: 1800 });
          warmedCount++;
          break;
        }

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      logger.info("Cache warming completed", { entityType, warmedCount });

      return { success: true, entityType, warmedCount };
    } catch (error) {
      logger.error("Failed to warm cache", { error, entityType });
      throw error;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);

emailWorker.on("completed", (job) => {
  logger.info("Email worker completed job", { jobId: job.id });
});

emailWorker.on("failed", (job, err) => {
  logger.error("Email worker failed job", { jobId: job?.id, error: err.message });
});

reportWorker.on("completed", (job) => {
  logger.info("Report worker completed job", { jobId: job.id });
});

reportWorker.on("failed", (job, err) => {
  logger.error("Report worker failed job", { jobId: job?.id, error: err.message });
});

paymentReconciliationWorker.on("completed", (job) => {
  logger.info("Payment reconciliation worker completed job", { jobId: job.id });
});

paymentReconciliationWorker.on("failed", (job, err) => {
  logger.error("Payment reconciliation worker failed job", { jobId: job?.id, error: err.message });
});

cacheWarmingWorker.on("completed", (job) => {
  logger.info("Cache warming worker completed job", { jobId: job.id });
});

cacheWarmingWorker.on("failed", (job, err) => {
  logger.error("Cache warming worker failed job", { jobId: job?.id, error: err.message });
});

export async function startWorkers() {
  logger.info("Starting BullMQ workers");

  await Promise.all([
    emailWorker.waitUntilReady(),
    reportWorker.waitUntilReady(),
    paymentReconciliationWorker.waitUntilReady(),
    cacheWarmingWorker.waitUntilReady(),
  ]);

  logger.info("All BullMQ workers started successfully");
}

export async function stopWorkers() {
  logger.info("Stopping BullMQ workers");

  await Promise.all([
    emailWorker.close(),
    reportWorker.close(),
    paymentReconciliationWorker.close(),
    cacheWarmingWorker.close(),
  ]);

  logger.info("All BullMQ workers stopped");
}
