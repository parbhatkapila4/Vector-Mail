import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const AURINKO_SCOPES = "Mail.Read Mail.Send";

export function buildAurinkoAuthUrlForService(
  serviceType: "Google" | "Office365",
): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType,
    responseType: "code",
    returnUrl: `${baseUrl}/api/aurinko/callback`,
    prompt: "consent",
    scopes: AURINKO_SCOPES,
  });
  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}

export async function buildAurinkoGoogleAuthUrl(): Promise<string> {
  return buildAurinkoAuthUrlForService("Google");
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
  console.log("[TOKEN] Exchanging OAuth code");
  console.log(
    "[TOKEN] Code:",
    code ? `${code.substring(0, 10)}...` : "MISSING",
  );

  const tokenUrl = `https://api.aurinko.io/v1/auth/token/${encodeURIComponent(code)}`;
  console.log(
    "[TOKEN] Token URL:",
    tokenUrl.replace(code, `${code.substring(0, 10)}...`),
  );

  try {
    const response = await axios.post(
      tokenUrl,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID!,
          password: process.env.AURINKO_CLIENT_SECRET!,
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[TOKEN] Response status:", response.status);
    console.log(
      "[TOKEN] Full response data:",
      JSON.stringify(response.data, null, 2),
    );

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

    console.log("[TOKEN] ✓ Success - accessToken and accountId present");
    console.log(
      "[TOKEN] API token:",
      accountToken ? "accountToken" : "accessToken (fallback)",
    );
    if (refreshToken) console.log("[TOKEN] ✓ Refresh token present (will use for silent renewal)");
    if (expiresIn) console.log("[TOKEN] ✓ expiresIn:", expiresIn, "seconds");

    return {
      accessToken: data.accessToken,
      accountId: String(data.accountId),
      accountToken: accountToken || data.accessToken,
      refreshToken: refreshToken ?? undefined,
      expiresIn: expiresIn ?? undefined,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[TOKEN] ✗ FAILED");
      console.error("[TOKEN] Status:", error.response?.status);
      console.error("[TOKEN] Status Text:", error.response?.statusText);
      console.error(
        "[TOKEN] Response Data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("[TOKEN] Request Config:", {
        url: error.config?.url,
        method: error.config?.method,
        hasAuth: !!error.config?.auth,
      });
    } else {
      console.error("[TOKEN] ✗ FAILED - Unknown error:", error);
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
        auth: {
          username: process.env.AURINKO_CLIENT_ID!,
          password: process.env.AURINKO_CLIENT_SECRET!,
        },
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      },
    );
    const data = response.data;
    const accessToken = data?.accessToken ?? data?.token;
    if (!accessToken) {
      console.warn("[TOKEN] Refresh response missing accessToken:", Object.keys(data ?? {}));
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
    console.log("[TOKEN] ✓ Refresh successful for account", accountId);
    return { accessToken, accountToken, expiresIn, refreshToken: nextRefresh };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn(
        "[TOKEN] Refresh failed:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.warn("[TOKEN] Refresh failed:", error);
    }
    return null;
  }
}

export async function getAccountInfo(accessToken: string, accountId: string) {
  console.log("[ACCOUNT] Verifying account");

  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Aurinko-Account-Id": accountId,
      },
    });

    console.log("[ACCOUNT] ✓ Verified");

    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[ACCOUNT] ✗ FAILED",
        error.response?.status,
        error.response?.data,
      );
    }
    throw error;
  }
}
