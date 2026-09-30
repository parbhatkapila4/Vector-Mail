import { normalizeEmail } from "@/lib/email-normalize";

const encoder = new TextEncoder();
const SIGNATURE_LENGTH = 43;

export const ACCESS_GRANT_COOKIE = "vm_access_grant";
export const ACCESS_GRANT_TTL_SECONDS = 300;

interface GrantPayload {
  email: string;
  exp: number;
}

function getSigningSecret(): string | null {
  const secret =
    process.env.SESSION_COOKIE_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim();
  return secret ? secret : null;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64Url(value: string): string {
  return bytesToBase64Url(encoder.encode(value));
}

function base64UrlToString(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function accessGrantCookieOptions(isSecure: boolean) {
  return {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    maxAge: ACCESS_GRANT_TTL_SECONDS,
  };
}
export async function signAccessGrant(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const secret = getSigningSecret();
  if (!secret) return null;

  const payload: GrantPayload = {
    email: normalized,
    exp: Date.now() + ACCESS_GRANT_TTL_SECONDS * 1000,
  };
  const encoded = stringToBase64Url(JSON.stringify(payload));
  return `${encoded}.${await sign(encoded, secret)}`;
}
export async function verifyAccessGrant(
  raw: string | null | undefined,
): Promise<string | null> {
  const value = raw?.trim();
  if (!value) return null;

  const secret = getSigningSecret();
  if (!secret) return null;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!encoded || signature.length !== SIGNATURE_LENGTH) return null;

  const expected = await sign(encoded, secret);
  if (!constantTimeEqual(signature, expected)) return null;

  const json = base64UrlToString(encoded);
  if (!json) return null;

  let payload: GrantPayload;
  try {
    payload = JSON.parse(json) as GrantPayload;
  } catch {
    return null;
  }

  if (typeof payload?.exp !== "number" || payload.exp <= Date.now()) return null;
  return normalizeEmail(payload.email);
}
