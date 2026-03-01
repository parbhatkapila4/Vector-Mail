import type { NextRequest } from "next/server";
import { DEMO_COOKIE } from "./constants";

/**
 * Server-only: determines if the current request is in demo mode.
 * Demo mode when: query param demo=1 OR cookie vectormail_demo is set.
 */
export function isDemoMode(req: NextRequest): boolean {
  const url = new URL(req.url);
  if (url.searchParams.get("demo") === "1") return true;
  const cookie = req.cookies.get(DEMO_COOKIE)?.value;
  return cookie === "1";
}

/**
 * Get demo cookie value from a Request (e.g. in API/TRPC).
 */
export function getDemoCookie(req: Request | undefined): string | null {
  if (!req) return null;
  const nextReq = req as NextRequest;
  const cookie = nextReq.cookies?.get?.(DEMO_COOKIE)?.value;
  return cookie?.trim() ?? null;
}
