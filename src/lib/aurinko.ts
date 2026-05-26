import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { env } from "@/env.js";

const AURINKO_SCOPES = "Mail.Read Mail.Send";

function requireAurinkoCredentials(): { id: string; secret: string } {
  if (!env.AURINKO_CLIENT_ID || !env.AURINKO_CLIENT_SECRET) {
    throw new Error(
      "Aurinko credentials missing. Set AURINKO_CLIENT_ID and AURINKO_CLIENT_SECRET in your environment.",
    );
  }
  return { id: env.AURINKO_CLIENT_ID, secret: env.AURINKO_CLIENT_SECRET };
}

export function buildAurinkoAuthUrlForService(
  serviceType: "Google" | "Office365",
  state?: string,
): string {
  const baseUrl = env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const { id } = requireAurinkoCredentials();
  const params = new URLSearchParams({
    clientId: id,
    serviceType,
    responseType: "code",
    returnUrl: `${baseUrl}/api/aurinko/callback`,
    prompt: "consent",
    scopes: AURINKO_SCOPES,
  });
  if (state) params.set("state", state);
  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}

export async function buildAurinkoGoogleAuthUrl(state?: string): Promise<string> {
  return buildAurinkoAuthUrlForService("Google", state);
}

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (AURINKO_SCOPES.includes("googleapis.com")) {
    throw new Error(
      "INVALID SCOPES: Google OAuth URLs are NOT supported by Aurinko",
    );
  }

  if (AURINKO_SCOPES.includes(",")) {
    throw new Error(
      "INVALID SCOPES: Aurinko requires space-separated scopes, not comma-separated",
    );
  }

  return buildAurinkoAuthUrlForService(serviceType);
};

export async function exchangeAurinkoCodeForToken(code: string) {
  aurinkoLog.log("[TOKEN] Exchanging OAuth code");
  aurinkoLog.log(
    "[TOKEN] Code:",
    code ? `${code.substring(0, 10)}...` : "MISSING",
  );

  const tokenUrl = `https://api.aurinko.io/v1/auth/token/${encodeURIComponent(code)}`;
  aurinkoLog.log(
    "[TOKEN] Token URL:",
    tokenUrl.replace(code, `${code.substring(0, 10)}...`),
  );

  try {
    const response = await axios.post(
      tokenUrl,
      {},
      {
        auth: (() => {
          const { id, secret } = requireAurinkoCredentials();
          return { username: id, password: secret };
        })(),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    aurinkoLog.log("[TOKEN] Response status:", response.status);
    aurinkoLog.log("[TOKEN] Response shape:", {
      hasAccessToken: !!response.data?.accessToken,
      hasAccountToken: !!(
        response.data?.accountToken ?? response.data?.account_token
      ),
      hasRefreshToken: !!(
        response.data?.refreshToken ?? response.data?.refresh_token
      ),
      hasAccountId: !!response.data?.accountId,
    });

    const data = response.data;

    if (!data?.accessToken) {
      throw new Error(
        `Missing accessToken in response: ${JSON.stringify(data, null, 2)}`,
      );
    }

    if (!data?.accountId) {
      throw new Error(
        `Missing accountId in response: ${JSON.stringify(data, null, 2)}`,
      );
    }

    const accountToken = data.accountToken || data.token || data.account_token;
    const refreshToken =
      data.refreshToken ?? data.refresh_token ?? null;
    const expiresIn =
      typeof data.expiresIn === "number"
        ? data.expiresIn
        : typeof data.expires_in === "number"
          ? data.expires_in
          : null;

    aurinkoLog.log("[TOKEN] âœ“ Success - accessToken and accountId present");
    aurinkoLog.log(
      "[TOKEN] API token:",
      accountToken ? "accountToken" : "accessToken (fallback)",
    );
    if (refreshToken) aurinkoLog.log("[TOKEN] âœ“ Refresh token present (will use for silent renewal)");
    if (expiresIn) aurinkoLog.log("[TOKEN] âœ“ expiresIn:", expiresIn, "seconds");

    return {
      accessToken: data.accessToken,
      accountId: String(data.accountId),
      accountToken: accountToken || data.accessToken,
      refreshToken: refreshToken ?? undefined,
      expiresIn: expiresIn ?? undefined,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      aurinkoLog.error("[TOKEN] âœ- FAILED");
      aurinkoLog.error("[TOKEN] Status:", error.response?.status);
      aurinkoLog.error("[TOKEN] Status Text:", error.response?.statusText);
      aurinkoLog.error(
        "[TOKEN] Response Data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      aurinkoLog.error("[TOKEN] Request Config:", {
        url: error.config?.url,
        method: error.config?.method,
        hasAuth: !!error.config?.auth,
      });
    } else {
      aurinkoLog.error("[TOKEN] âœ- FAILED - Unknown error:", error);
    }
    throw error;
  }
}

export async function refreshAurinkoToken(
  accountId: string,
  refreshToken: string,
): Promise<{
  accessToken: string;
  accountToken?: string;
  expiresIn?: number;
  refreshToken?: string;
} | null> {
  try {
    const response = await axios.post<{
      accessToken?: string;
      accountToken?: string;
      token?: string;
      account_token?: string;
      expiresIn?: number;
      expires_in?: number;
      refreshToken?: string;
      refresh_token?: string;
    }>(
      "https://api.aurinko.io/v1/auth/refresh",
      { accountId, refreshToken },
      {
        auth: (() => {
          const { id, secret } = requireAurinkoCredentials();
          return { username: id, password: secret };
        })(),
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      },
    );
    const data = response.data;
    const accessToken = data?.accessToken ?? data?.token;
    if (!accessToken) {
      aurinkoLog.warn("[TOKEN] Refresh response missing accessToken:", Object.keys(data ?? {}));
      return null;
    }
    const accountToken =
      data?.accountToken ?? data?.token ?? data?.account_token ?? accessToken;
    const expiresIn =
      typeof data?.expiresIn === "number"
        ? data.expiresIn
        : typeof data?.expires_in === "number"
          ? data.expires_in
          : undefined;
    const nextRefresh =
      data?.refreshToken ?? data?.refresh_token ?? undefined;
    aurinkoLog.log("[TOKEN] âœ“ Refresh successful for account", accountId);
    return { accessToken, accountToken, expiresIn, refreshToken: nextRefresh };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      aurinkoLog.warn(
        "[TOKEN] Refresh failed:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      aurinkoLog.warn("[TOKEN] Refresh failed:", error);
    }
    return null;
  }
}

export async function getAccountInfo(accessToken: string, accountId: string) {
  aurinkoLog.log("[ACCOUNT] Verifying account");

  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Aurinko-Account-Id": accountId,
      },
    });

    aurinkoLog.log("[ACCOUNT] âœ“ Verified");

    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      aurinkoLog.error(
        "[ACCOUNT] âœ- FAILED",
        error.response?.status,
        error.response?.data,
      );
    }
    throw error;
  }
}

import { makeTagLogger } from "@/lib/logging/console-shim";
const aurinkoLog = makeTagLogger("aurinko");
