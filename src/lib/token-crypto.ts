import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { serverLog } from "@/lib/logging/server-logger";

const ENVELOPE_PREFIX = "enc:v1:";
const IV_BYTES = 12;
const ALGO = "aes-256-gcm";

let resolved = false;
let cachedKey: Buffer | null = null;

function getKey(): Buffer | null {
  if (resolved) return cachedKey;
  resolved = true;
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) {
    cachedKey = null;
    return null;
  }
  let key: Buffer | null = null;
  try {
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      key = Buffer.from(raw, "hex");
    } else {
      const b = Buffer.from(raw, "base64");
      if (b.length === 32) key = b;
    }
  } catch {
    key = null;
  }
  if (!key || key.length !== 32) {
    serverLog.warn(
      {},
      "token-crypto: TOKEN_ENCRYPTION_KEY is set but not a valid 32-byte key (base64 or hex). Encryption DISABLED.",
    );
    cachedKey = null;
    return null;
  }
  cachedKey = key;
  return key;
}

export function isTokenEncryptionEnabled(): boolean {
  return getKey() !== null;
}

export function isEncryptedToken(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(ENVELOPE_PREFIX);
}

export function encryptToken(plain: string | null | undefined): string {
  const value = plain ?? "";
  const key = getKey();
  if (!key || value === "") return value;
  if (isEncryptedToken(value)) return value;
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return (
    ENVELOPE_PREFIX +
    [
      iv.toString("base64url"),
      tag.toString("base64url"),
      ct.toString("base64url"),
    ].join(":")
  );
}

export function decryptToken(stored: string | null | undefined): string {
  const value = stored ?? "";
  if (value === "" || !isEncryptedToken(value)) return value;
  const key = getKey();
  if (!key) {
    serverLog.error(
      {},
      "token-crypto: encountered an encrypted token but TOKEN_ENCRYPTION_KEY is not set/valid. Cannot decrypt.",
    );
    return value;
  }
  try {
    const body = value.slice(ENVELOPE_PREFIX.length);
    const [ivB64, tagB64, ctB64] = body.split(":");
    if (!ivB64 || !tagB64 || !ctB64) return value;
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const ct = Buffer.from(ctB64, "base64url");
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString("utf8");
  } catch (err) {
    serverLog.error(
      { err: err instanceof Error ? err.message : String(err) },
      "token-crypto: failed to decrypt token (wrong key or corrupt data)",
    );
    return value;
  }
}
