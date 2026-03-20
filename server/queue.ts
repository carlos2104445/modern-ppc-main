import { Queue, Worker, QueueEvents } from "bullmq";
import { Redis } from "ioredis";
import { logger } from "./logger";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface ReportJobData {
  userId: string;
  reportType: "earnings" | "campaigns" | "adviews";
  startDate: string;
  endDate: string;
  format: "pdf" | "csv" | "xlsx";
}

export interface PaymentReconciliationJobData {
  startDate: string;
  endDate: string;
}

export interface CacheWarmingJobData {
  entityType: "users" | "campaigns" | "stats";
}

export const emailQueue = new Queue<EmailJobData>("email", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600,
    },
  },
});

export const reportQueue = new Queue<ReportJobData>("report", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 50,
      age: 7 * 24 * 3600,
    },
    removeOnFail: {
      count: 100,
      age: 30 * 24 * 3600,
    },
  },
});

export const paymentReconciliationQueue = new Queue<PaymentReconciliationJobData>(
  "payment-reconciliation",
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 10000,
      },
      removeOnComplete: {
        count: 100,
        age: 30 * 24 * 3600,
      },
      removeOnFail: {
        count: 100,
        age: 90 * 24 * 3600,
      },
    },
  }
);

export const cacheWarmingQueue = new Queue<CacheWarmingJobData>("cache-warming", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
    removeOnComplete: {
      count: 10,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 50,
      age: 7 * 24 * 3600,
    },
  },
});

const emailQueueEvents = new QueueEvents("email", { connection });
const reportQueueEvents = new QueueEvents("report", { connection });
const paymentReconciliationQueueEvents = new QueueEvents("payment-reconciliation", { connection });
const cacheWarmingQueueEvents = new QueueEvents("cache-warming", { connection });

emailQueueEvents.on("completed", ({ jobId }) => {
  logger.info("Email job completed", { jobId });
});

emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Email job failed", { jobId, failedReason });
});

reportQueueEvents.on("completed", ({ jobId }) => {
  logger.info("Report job completed", { jobId });
});

reportQueueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Report job failed", { jobId, failedReason });
});

paymentReconciliationQueueEvents.on("completed", ({ jobId }) => {
  logger.info("Payment reconciliation job completed", { jobId });
});

paymentReconciliationQueueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Payment reconciliation job failed", { jobId, failedReason });
});

cacheWarmingQueueEvents.on("completed", ({ jobId }) => {
  logger.info("Cache warming job completed", { jobId });
});

cacheWarmingQueueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Cache warming job failed", { jobId, failedReason });
});

export async function addEmailJob(
  data: EmailJobData,
  options?: { delay?: number; priority?: number }
) {
  return await emailQueue.add("send-email", data, options);
}

export async function addReportJob(
  data: ReportJobData,
  options?: { delay?: number; priority?: number }
) {
  return await reportQueue.add("generate-report", data, options);
}

export async function addPaymentReconciliationJob(data: PaymentReconciliationJobData) {
  return await paymentReconciliationQueue.add("reconcile-payments", data);
}

export async function addCacheWarmingJob(data: CacheWarmingJobData) {
  return await cacheWarmingQueue.add("warm-cache", data);
}

export async function scheduleRecurringJobs() {
  await paymentReconciliationQueue.add(
    "daily-reconciliation",
    {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
    {
      repeat: {
        pattern: "0 2 * * *",
      },
    }
  );

  await cacheWarmingQueue.add(
    "hourly-cache-warming",
    {
      entityType: "stats",
    },
    {
      repeat: {
        pattern: "0 * * * *",
      },
    }
  );

  logger.info("Recurring jobs scheduled");
}

export async function getQueueStats() {
  const [emailCounts, reportCounts, reconciliationCounts, cacheCounts] = await Promise.all([
    emailQueue.getJobCounts(),
    reportQueue.getJobCounts(),
    paymentReconciliationQueue.getJobCounts(),
    cacheWarmingQueue.getJobCounts(),
  ]);

  return {
    email: emailCounts,
    report: reportCounts,
    paymentReconciliation: reconciliationCounts,
    cacheWarming: cacheCounts,
  };
}

export async function cleanQueues() {
  await Promise.all([
    emailQueue.clean(24 * 3600 * 1000, 100, "completed"),
    emailQueue.clean(7 * 24 * 3600 * 1000, 1000, "failed"),
    reportQueue.clean(7 * 24 * 3600 * 1000, 50, "completed"),
    reportQueue.clean(30 * 24 * 3600 * 1000, 100, "failed"),
    paymentReconciliationQueue.clean(30 * 24 * 3600 * 1000, 100, "completed"),
    paymentReconciliationQueue.clean(90 * 24 * 3600 * 1000, 100, "failed"),
    cacheWarmingQueue.clean(24 * 3600 * 1000, 10, "completed"),
    cacheWarmingQueue.clean(7 * 24 * 3600 * 1000, 50, "failed"),
  ]);

  logger.info("Queues cleaned");
}
