import { NextResponse } from "next/server";
import { db } from "@/server/db";
import {
  getEmbeddingP95Ms,
  getEmbeddingCallsCount,
  getEmbeddingFailuresCount,
  getRecentEmbeddingFailureCount,
  getSearchP95Ms,
  getAverageSearchTimeMs,
  getRecentSyncFailureCount,
  getLlmCallsCount,
} from "@/lib/metrics/store";

export const dynamic = "force-dynamic";

const CHECK_TIMEOUT_MS = 4000;
const STALE_SYNC_THRESHOLD_MIN = 60;

type ComponentStatus = "ok" | "down" | "unconfigured";
type OverallStatus = "ok" | "degraded" | "down";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

async function checkDatabase(): Promise<ComponentStatus> {
  try {
    await withTimeout(db.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS);
    return "ok";
  } catch {
    return "down";
  }
}

async function checkRedis(): Promise<ComponentStatus> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const redisUrl = process.env.REDIS_URL?.trim();

  if (upstashUrl && upstashToken) {
    try {
      const { Redis } = await import("@upstash/redis");
      const client = new Redis({ url: upstashUrl, token: upstashToken });
      await withTimeout(
        client.set("health:ping", "1", { ex: 10 }),
        CHECK_TIMEOUT_MS,
      );
      return "ok";
    } catch {
      return "down";
    }
  }

  if (redisUrl) {
    type RedisClient = {
      disconnect: () => void;
      set: (
        key: string,
        value: string,
        ...args: (string | number)[]
      ) => Promise<unknown>;
      connect: () => Promise<void>;
      status: string;
    };
    let client: RedisClient | null = null;
    try {
      const Redis = (await import("ioredis")).default as unknown as new (
        url: string,
        opts?: object,
      ) => RedisClient;
      client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
      });
      await withTimeout(
        (async () => {
          if (client!.status !== "ready") await client!.connect();
          await client!.set("health:ping", "1", "EX", 10);
        })(),
        CHECK_TIMEOUT_MS,
      );
      return "ok";
    } catch {
      return "down";
    } finally {
      try {
        client?.disconnect();
      } catch {

      }
    }
  }

  return "unconfigured";
}

function checkQueue(): ComponentStatus {
  const key = process.env.INNGEST_EVENT_KEY?.trim();
  return key ? "ok" : "unconfigured";
}

function checkLlm(): ComponentStatus {
  const openRouter = process.env.OPENROUTER_API_KEY?.trim();
  const gemini = process.env.GEMINI_API_KEY?.trim();
  return openRouter || gemini ? "ok" : "unconfigured";
}

async function getStaleSyncMinutes(): Promise<number | null> {
  try {
    const row = await withTimeout(
      db.account.findFirst({
        where: { lastInboxSyncAt: { not: null } },
        orderBy: { lastInboxSyncAt: "desc" },
        select: { lastInboxSyncAt: true },
      }),
      CHECK_TIMEOUT_MS,
    );
    if (!row?.lastInboxSyncAt) return null;
    return Math.floor((Date.now() - row.lastInboxSyncAt.getTime()) / 60_000);
  } catch {
    return null;
  }
}

function deriveStatus(
  database: ComponentStatus,
  redis: ComponentStatus,
  queue: ComponentStatus,
  llm: ComponentStatus,
  recentEmbeddingFailures: number,
  staleSyncMinutes: number | null,
): OverallStatus {
  if (database === "down") return "down";
  const anyDown = redis === "down" || queue === "down" || llm === "down";
  if (anyDown) return "degraded";
  if (recentEmbeddingFailures > 5) return "degraded";
  if (
    staleSyncMinutes !== null &&
    staleSyncMinutes > STALE_SYNC_THRESHOLD_MIN
  ) {
    return "degraded";
  }
  return "ok";
}

export async function GET() {
  const [database, redis, staleSyncMinutes] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    getStaleSyncMinutes(),
  ]);
  const queue = checkQueue();
  const llm = checkLlm();
  const recentEmbeddingFailures = getRecentEmbeddingFailureCount();

  const status = deriveStatus(
    database,
    redis,
    queue,
    llm,
    recentEmbeddingFailures,
    staleSyncMinutes,
  );

  const body = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    components: {
      database,
      redis,
      queue,
      llm,
    },
    metrics: {
      search: {
        p95Ms: getSearchP95Ms(),
        avgMs: getAverageSearchTimeMs(),
      },
      embedding: {
        p95Ms: getEmbeddingP95Ms(),
        callsTotal: getEmbeddingCallsCount(),
        failuresTotal: getEmbeddingFailuresCount(),
        failuresLast5Min: recentEmbeddingFailures,
      },
      sync: {
        recentFailures: getRecentSyncFailureCount(),
        mostRecentSyncAgeMinutes: staleSyncMinutes,
      },
      llm: {
        callsTotal: getLlmCallsCount(),
      },
    },
  };

  const httpStatus = status === "down" ? 503 : 200;
  return NextResponse.json(body, { status: httpStatus });
}
