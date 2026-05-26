import { NextRequest, NextResponse } from "next/server";
export const SEARCH_LIMIT_PER_MINUTE = 60;
export const AI_LIMIT_PER_MINUTE = 100;

const WINDOW_MS = 60 * 1000;

interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

class RateLimiter {
  private cache: Map<string, number[]>;
  private interval: number;
  private limit: number;

  constructor(config: RateLimitConfig) {
    this.cache = new Map();
    this.interval = config.interval;
    this.limit = config.uniqueTokenPerInterval;
  }

  check(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = this.cache.get(identifier) || [];

    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.interval,
    );

    if (validTimestamps.length >= this.limit) {
      return { success: false, remaining: 0 };
    }

    validTimestamps.push(now);
    this.cache.set(identifier, validTimestamps);

    this.cleanup();

    return {
      success: true,
      remaining: this.limit - validTimestamps.length,
    };
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((timestamps, key) => {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.interval,
      );

      if (validTimestamps.length === 0) {
        keysToDelete.push(key);
      } else {
        this.cache.set(key, validTimestamps);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

const PER_IP_LIMITS = {
  api: 100,
  auth: 5,
  emailSend: 10,
} as const;

const limiters = {
  api: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: PER_IP_LIMITS.api }),
  auth: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: PER_IP_LIMITS.auth }),
  emailSend: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: PER_IP_LIMITS.emailSend,
  }),
};

const userSearchLimiter = new RateLimiter({
  interval: WINDOW_MS,
  uniqueTokenPerInterval: SEARCH_LIMIT_PER_MINUTE,
});
const userAiLimiter = new RateLimiter({
  interval: WINDOW_MS,
  uniqueTokenPerInterval: AI_LIMIT_PER_MINUTE,
});

interface RateLimitRedis {
  incr(key: string): Promise<number>;
  pexpire(key: string, ms: number): Promise<unknown>;
}

let rlBackendResolved = false;
let rlRedis: RateLimitRedis | null = null;

function getRateLimitRedis(): RateLimitRedis | null {
  if (rlBackendResolved) return rlRedis;
  rlBackendResolved = true;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl?.trim() && upstashToken?.trim()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require("@upstash/redis");
      rlRedis = new Redis({ url: upstashUrl, token: upstashToken }) as RateLimitRedis;
      return rlRedis;
    } catch {
    }
  }
  const url = process.env.REDIS_URL;
  if (url?.trim()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis") as new (url: string, opts?: object) => RateLimitRedis;
      rlRedis = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: false });
      return rlRedis;
    } catch {
    }
  }
  rlRedis = null;
  return null;
}

async function redisFixedWindow(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number } | null> {
  const client = getRateLimitRedis();
  if (!client) return null;
  try {
    const count = await client.incr(key);
    if (count === 1) await client.pexpire(key, windowMs);
    return { success: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return null;
  }
}

export type UserRateLimitType = "search" | "ai";

export async function checkUserRateLimit(
  userId: string,
  type: UserRateLimitType,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit =
    type === "search" ? SEARCH_LIMIT_PER_MINUTE : AI_LIMIT_PER_MINUTE;
  const redisResult = await redisFixedWindow(
    `rl:user:${type}:${userId}`,
    limit,
    WINDOW_MS,
  );
  if (redisResult) {
    return {
      allowed: redisResult.success,
      remaining: redisResult.remaining,
      limit,
    };
  }
  const limiter = type === "search" ? userSearchLimiter : userAiLimiter;
  const { success, remaining } = limiter.check(`${type}:${userId}`);
  return { allowed: success, remaining, limit };
}

export function rateLimit429Response(options: {
  message?: string;
  remaining?: number;
  limit?: number;
  retryAfterSec?: number;
}): NextResponse {
  const {
    message = "Too many requests. Try again later.",
    remaining = 0,
    limit = 60,
    retryAfterSec = 60,
  } = options;
  return NextResponse.json(
    { error: "Rate limit exceeded", message },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}

export function getIdentifier(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelFwd = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")
    .pop()
    ?.trim();
  if (vercelFwd) return vercelFwd;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",").pop()?.trim() : "unknown";
  return ip || "unknown";
}

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof limiters = "api",
): Promise<NextResponse | null> {
  const identifier = getIdentifier(request);
  const limit = PER_IP_LIMITS[type];

  let success: boolean;
  let remaining: number;
  const redisResult = await redisFixedWindow(
    `rl:ip:${type}:${identifier}`,
    limit,
    WINDOW_MS,
  );
  if (redisResult) {
    success = redisResult.success;
    remaining = redisResult.remaining;
  } else {
    const r = limiters[type].check(identifier);
    success = r.success;
    remaining = r.remaining;
  }

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "Retry-After": "60",
        },
      },
    );
  }

  return null;
}

export { limiters };
