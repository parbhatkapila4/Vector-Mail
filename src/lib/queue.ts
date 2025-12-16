import { logger } from "./logger";

type JobStatus = "pending" | "processing" | "completed" | "failed";

interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processedAt?: number;
  error?: string;
}

type JobHandler<T = unknown> = (data: T) => Promise<void>;

class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler<unknown>> = new Map();
  private processing: Set<string> = new Set();
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
  }

  private startProcessing() {
    this.interval = setInterval(() => {
      this.processJobs();
    }, 5000);
  }

  registerHandler<T = unknown>(type: string, handler: JobHandler<T>) {
    this.handlers.set(type, handler as JobHandler<unknown>);
    logger.info(`Handler registered: ${type}`);
  }

  async add<T = unknown>(
    type: string,
    data: T,
    options: { maxAttempts?: number } = {},
  ): Promise<string> {
    const job: Job<T> = {
      id: crypto.randomUUID(),
      type,
      data,
      status: "pending",
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: Date.now(),
    };

    this.jobs.set(job.id, job);
    logger.debug(`Job added: ${type}`, { jobId: job.id });

    return job.id;
  }

  private async processJobs() {
    const pendingJobs = Array.from(this.jobs.values()).filter(
      (job) => job.status === "pending" && !this.processing.has(job.id),
    );

    for (const job of pendingJobs.slice(0, 5)) {
      this.processJob(job);
    }
  }

  private async processJob(job: Job) {
    if (this.processing.has(job.id)) return;

    this.processing.add(job.id);
    job.status = "processing";
    job.attempts++;

    const handler = this.handlers.get(job.type);

    if (!handler) {
      logger.error(`No handler found for job type: ${job.type}`);
      job.status = "failed";
      job.error = "No handler found";
      this.processing.delete(job.id);
      return;
    }

    try {
      logger.debug(`Processing: ${job.type}`, { jobId: job.id });
      await handler(job.data);

      job.status = "completed";
      job.processedAt = Date.now();
      logger.info(`Completed: ${job.type}`, { jobId: job.id });

      setTimeout(() => this.jobs.delete(job.id), 3600000);
    } catch (error) {
      logger.error(`Job failed: ${job.type}`, {
        jobId: job.id,
        attempt: job.attempts,
        error: error instanceof Error ? error.message : "Unknown",
      });

      if (job.attempts >= job.maxAttempts) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown";
        logger.error(`Permanently failed: ${job.type}`, { jobId: job.id });
      } else {
        job.status = "pending";
        logger.info(`Retrying: ${job.type}`, {
          jobId: job.id,
          attempt: job.attempts,
          max: job.maxAttempts,
        });
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getJobs(type?: string): Job[] {
    const allJobs = Array.from(this.jobs.values());
    return type ? allJobs.filter((job) => job.type === type) : allJobs;
  }

  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    };
  }

  clear() {
    this.jobs.clear();
    this.processing.clear();
  }

  cleanup() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export const queue = new JobQueue();

queue.registerHandler("email-sync", async (data: { accountId: string }) => {
  logger.info("Processing email sync", data);
});

queue.registerHandler("email-analysis", async (data: { emailId: string }) => {
  logger.info("Processing email analysis", data);
});

queue.registerHandler(
  "embedding-generation",
  async (data: { emailId: string }) => {
    logger.info("Generating email embedding", data);
  },
);
