import { timingSafeEqual } from "node:crypto";
export function safeSecretEqual(
  candidate: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!candidate || !secret) return false;

  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(secret, "utf8");

  if (a.length !== b.length) {
    try {
      timingSafeEqual(b, b);
    } catch {
      /* ignore */
    }
    return false;
  }

  return timingSafeEqual(a, b);
}

export function anySafeSecretEqual(
  candidates: Array<string | null | undefined>,
  secret: string | null | undefined,
): boolean {
  if (!secret) return false;
  let matched = false;
  for (const c of candidates) {
    if (safeSecretEqual(c, secret)) matched = true;
  }
  return matched;
}
