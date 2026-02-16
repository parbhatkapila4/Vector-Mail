import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const CHECK_TIMEOUT_MS = 4000;

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
    type RedisClient = { disconnect: () => void; set: (key: string, value: string, ...args: (string | number)[]) => Promise<unknown>; connect: () => Promise<void>; status: string };
    let client: RedisClient | null = null;
    try {
      const Redis = (await import("ioredis")).default as unknown as new (url: string, opts?: object) => RedisClient;
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

function deriveStatus(
  database: ComponentStatus,
  redis: ComponentStatus,
  queue: ComponentStatus,
  llm: ComponentStatus,
): OverallStatus {
  if (database === "down") return "down";
  const anyDown =
    redis === "down" || queue === "down" || llm === "down";
  return anyDown ? "degraded" : "ok";
}

export async function GET() {
  const [database, redis] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);
  const queue = checkQueue();
  const llm = checkLlm();

  const status = deriveStatus(database, redis, queue, llm);

  const body = {
    status,
    database,
    redis,
    queue,
    llm,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  };

  const httpStatus = status === "down" ? 503 : 200;
  return NextResponse.json(body, { status: httpStatus });
}
