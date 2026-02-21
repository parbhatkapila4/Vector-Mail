"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const aurinkoScopes = "Mail.Read Mail.Send";

  if (aurinkoScopes.includes("googleapis.com")) {
    throw new Error(
      "INVALID SCOPES: Google OAuth URLs are NOT supported by Aurinko",
    );
  }

  if (aurinkoScopes.includes(",")) {
    throw new Error(
      "INVALID SCOPES: Aurinko requires space-separated scopes, not comma-separated",
    );
  }

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType,
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/oauth/intermediate`,
    prompt: "consent",
    scopes: aurinkoScopes,
  });

  const authUrl = `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;

  console.log("[OAuth] Service:", serviceType);
  console.log("[OAuth] Scopes:", aurinkoScopes);
  console.log("[OAuth] URL:", authUrl);

  return authUrl;
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

    console.log("[TOKEN] ✓ Success - accessToken and accountId present");
    console.log(
      "[TOKEN] API token:",
      accountToken ? "accountToken" : "accessToken (fallback)",
    );

    return {
      accessToken: data.accessToken,
      accountId: String(data.accountId),
      accountToken: accountToken || data.accessToken,
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
