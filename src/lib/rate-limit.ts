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

const limiters = {
  api: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 100 }),
  auth: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 5 }),
  emailSend: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10,
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

export type UserRateLimitType = "search" | "ai";

export function checkUserRateLimit(
  userId: string,
  type: UserRateLimitType,
): { allowed: boolean; remaining: number; limit: number } {
  const limiter = type === "search" ? userSearchLimiter : userAiLimiter;
  const key = `${type}:${userId}`;
  const { success, remaining } = limiter.check(key);
  const limit = type === "search" ? SEARCH_LIMIT_PER_MINUTE : AI_LIMIT_PER_MINUTE;
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
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : "unknown";
  return ip || "unknown";
}

export function rateLimit(
  request: NextRequest,
  type: keyof typeof limiters = "api",
): NextResponse | null {
  const identifier = getIdentifier(request);
  const limiter = limiters[type];
  const { success, remaining } = limiter.check(identifier);

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limiter["limit"].toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "Retry-After": "60",
        },
      },
    );
  }

  return null;
}

export { limiters };
