const encoder = new TextEncoder();
const SIGNATURE_LENGTH = 43;

export const SESSION_COOKIE = "vectormail_session_user";
export function sessionCookieOptions(isSecure: boolean) {
  return {
    path: "/",
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24,
  };
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
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(userId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(userId));
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
export async function signSessionCookieValue(
  userId: string,
): Promise<string | null> {
  const trimmed = userId?.trim();
  if (!trimmed) return null;
  const secret = getSigningSecret();
  if (!secret) return null;
  return `${trimmed}.${await sign(trimmed, secret)}`;
}
export async function verifySessionCookieValue(
  raw: string | null | undefined,
): Promise<string | null> {
  const value = raw?.trim();
  if (!value) return null;

  const secret = getSigningSecret();
  if (!secret) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!userId || signature.length !== SIGNATURE_LENGTH) return null;

  const expected = await sign(userId, secret);
  return constantTimeEqual(signature, expected) ? userId : null;
}
