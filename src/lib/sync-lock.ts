
import { serverLog } from "@/lib/logging/server-logger";

export interface AcquireResult {
  acquired: boolean;
  token?: string;
}

function createLockToken(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `lock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const LOCK_KEY_PREFIX = "sync:lock:";
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const MAX_WAIT_MS = 30 * 60 * 1000;
const RETRY_SLEEP_MS = 2000;

type Backend = "upstash" | "ioredis" | "memory";

let backend: Backend | null = null;
let upstashClient: { set: (k: string, v: string, opts?: { nx?: boolean; ex?: number }) => Promise<string | null>; eval: (script: string, keys: string[], args: string[]) => Promise<unknown> } | null = null;
let ioredisClient: IoredisClient | null = null;
let backendResolved = false;

interface IoredisClient {
  set(key: string, value: string, ...args: [string, number, string]): Promise<string | null>;
  eval(script: string, numKeys: number, ...args: string[]): Promise<unknown>;
  connect(): Promise<void>;
  status: string;
  on?(event: string, fn: (err: unknown) => void): void;
}

function getBackend(): Backend {
  if (backendResolved) return backend ?? "memory";
  backendResolved = true;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl && upstashUrl.trim() !== "" && upstashToken && upstashToken.trim() !== "") {
    try {
      const { Redis } = require("@upstash/redis");
      upstashClient = new Redis({ url: upstashUrl, token: upstashToken });
      backend = "upstash";
      if (process.env.NODE_ENV !== "test") {
        serverLog.info({ backend: "upstash" }, "sync-lock: using Upstash Redis REST");
      }
      return "upstash";
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err) },
        "sync-lock: Upstash init failed, trying REDIS_URL or in-memory",
      );
    }
  }

  const url = process.env.REDIS_URL;
  if (url && url.trim() !== "") {
    try {
      const Redis = require("ioredis") as new (url: string, opts?: object) => IoredisClient;
      const client = new Redis(url, {
        maxRetriesPerRequest: 2,
        retryStrategy(times: number) {
          if (times > 2) return null;
          return 500;
        },
        lazyConnect: true,
      });
      client.on?.("error", (err: unknown) => {
        serverLog.warn(
          { err: err instanceof Error ? err.message : String(err) },
          "sync-lock: Redis client error",
        );
      });
      ioredisClient = client;
      backend = "ioredis";
      if (process.env.NODE_ENV !== "test") {
        serverLog.info({ backend: "ioredis" }, "sync-lock: using Redis (REDIS_URL)");
      }
      return "ioredis";
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err) },
        "sync-lock: Redis connection failed, using in-memory fallback",
      );
    }
  }

  if (process.env.NODE_ENV !== "test") {
    serverLog.info(
      { reason: "no REDIS_URL or Upstash env" },
      "sync-lock: using in-memory fallback (one sync per account per process only)",
    );
  }
  backend = "memory";
  return "memory";
}

async function ensureIoredisConnected(): Promise<boolean> {
  if (!ioredisClient) return false;
  try {
    if (ioredisClient.status !== "ready") await ioredisClient.connect();
    return true;
  } catch {
    return false;
  }
}

export async function acquire(
  accountId: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<AcquireResult> {
  const be = getBackend();
  const key = LOCK_KEY_PREFIX + accountId;
  const token = createLockToken();
  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));

  if (be === "upstash" && upstashClient) {
    try {
      const result = await upstashClient.set(key, token, { nx: true, ex: ttlSec });
      if (result === "OK") return { acquired: true, token };
      return { acquired: false };
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err), accountId },
        "sync-lock: acquire failed",
      );
      return { acquired: false };
    }
  }

  if (be === "ioredis" && ioredisClient) {
    const ok = await ensureIoredisConnected();
    if (!ok) return { acquired: false };
    try {
      const result = await ioredisClient.set(key, token, "EX", ttlSec, "NX");
      if (result === "OK") return { acquired: true, token };
      return { acquired: false };
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err), accountId },
        "sync-lock: acquire failed",
      );
      return { acquired: false };
    }
  }

  return { acquired: false };
}

export async function release(accountId: string, token: string): Promise<void> {
  const be = getBackend();
  const key = LOCK_KEY_PREFIX + accountId;
  const script = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
  `;

  if (be === "upstash" && upstashClient) {
    try {
      await upstashClient.eval(script, [key], [token]);
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err), accountId },
        "sync-lock: release failed (key will expire by TTL)",
      );
    }
    return;
  }

  if (be === "ioredis" && ioredisClient) {
    try {
      await ioredisClient.eval(script, 1, key, token);
    } catch (err) {
      serverLog.warn(
        { err: err instanceof Error ? err.message : String(err), accountId },
        "sync-lock: release failed (key will expire by TTL)",
      );
    }
  }
}

const memoryLocks = new Map<string, { token: string }>();

function acquireMemory(accountId: string): AcquireResult {
  if (memoryLocks.has(accountId)) return { acquired: false };
  const token = createLockToken();
  memoryLocks.set(accountId, { token });
  return { acquired: true, token };
}

function releaseMemory(accountId: string, token: string): void {
  const cur = memoryLocks.get(accountId);
  if (cur && cur.token === token) memoryLocks.delete(accountId);
}

export async function withLock<T>(
  accountId: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const be = getBackend();
  const useRedis = be === "upstash" || be === "ioredis";
  const start = Date.now();

  let acquired = false;
  let token: string | undefined;

  if (useRedis) {
    while (Date.now() - start < MAX_WAIT_MS) {
      const result = await acquire(accountId, ttlMs);
      if (result.acquired && result.token) {
        acquired = true;
        token = result.token;
        break;
      }
      await new Promise((r) => setTimeout(r, RETRY_SLEEP_MS));
    }
    if (!acquired) {
      throw new Error(
        `sync-lock: failed to acquire lock for account ${accountId} within ${MAX_WAIT_MS}ms`,
      );
    }
  } else {
    while (Date.now() - start < MAX_WAIT_MS) {
      const result = acquireMemory(accountId);
      if (result.acquired && result.token) {
        acquired = true;
        token = result.token;
        break;
      }
      await new Promise((r) => setTimeout(r, RETRY_SLEEP_MS));
    }
    if (!acquired) {
      throw new Error(
        `sync-lock: in-memory lock busy for account ${accountId} (waited ${MAX_WAIT_MS}ms)`,
      );
    }
  }

  try {
    return await fn();
  } finally {
    if (token) {
      if (useRedis) release(accountId, token);
      else releaseMemory(accountId, token);
    }
  }
}
