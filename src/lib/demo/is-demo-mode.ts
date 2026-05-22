import type { NextRequest } from "next/server";
import { DEMO_COOKIE } from "./constants";

export function isDemoMode(req: NextRequest): boolean {
  const url = new URL(req.url);
  if (url.searchParams.get("demo") === "1") return true;
  const cookie = req.cookies.get(DEMO_COOKIE)?.value;
  return cookie === "1";
}

export function getDemoCookie(req: Request | undefined): string | null {
  if (!req) return null;
  const nextReq = req as NextRequest;
  const cookie = nextReq.cookies?.get?.(DEMO_COOKIE)?.value;
  return cookie?.trim() ?? null;
}
