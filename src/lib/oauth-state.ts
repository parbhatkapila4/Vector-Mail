import { randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { safeSecretEqual } from "@/lib/timing-safe-secret";

const STATE_COOKIE = "vm_oauth_state";
const STATE_TTL_SECONDS = 600;

export function isOAuthStateEnforced(): boolean {
  return process.env.OAUTH_STATE_ENFORCED !== "false";
}

export function generateOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function setOAuthStateCookie(res: NextResponse, state: string): void {
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });
}

export function clearOAuthStateCookie(res: NextResponse): void {
  res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
}

export type OAuthStateCheck =
  | { ok: true }
  | { ok: false; reason: "missing_cookie" | "missing_state" | "mismatch" };

export function checkOAuthState(
  req: NextRequest,
  returnedState: string | null | undefined,
): OAuthStateCheck {
  const cookieState = req.cookies.get(STATE_COOKIE)?.value?.trim();
  if (!cookieState) return { ok: false, reason: "missing_cookie" };
  if (!returnedState) return { ok: false, reason: "missing_state" };
  if (!safeSecretEqual(cookieState, returnedState)) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}
