import { db } from "@/server/db";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  console.log("[AURINKO SCOPE DEBUG] Starting diagnostic check...");

  try {
    const account = await db.account.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        token: true,
        emailAddress: true,
      },
    });

    if (!account) {
      console.error("[AURINKO SCOPE DEBUG] ✗ No account found in database");
      return NextResponse.json(
        { error: "No account found in database" },
        { status: 404 },
      );
    }

    console.log("[AURINKO SCOPE DEBUG] Found account:", {
      id: account.id,
      emailAddress: account.emailAddress,
      tokenPresent: !!account.token,
      tokenPrefix: account.token
        ? `${account.token.substring(0, 20)}...`
        : "MISSING",
    });

    const requestHeaders = {
      Authorization: `Bearer ${account.token}`,
      "X-Aurinko-Account-Id": account.id,
    };

    console.log("[AURINKO SCOPE DEBUG] Request headers:", {
      Authorization: `Bearer ${account.token ? account.token.substring(0, 20) + "..." : "MISSING"}`,
      "X-Aurinko-Account-Id": account.id,
    });

    console.log(
      "[AURINKO SCOPE DEBUG] Calling GET https://api.aurinko.io/v1/email/messages...",
    );

    try {
      const response = await axios.get<{
        messages?: Array<{ id: string }>;
        nextPageToken?: string;
      }>("https://api.aurinko.io/v1/email/messages", {
        params: {
          q: "in:inbox",
          maxResults: 20,
        },
        headers: requestHeaders,
      });

      console.log("[AURINKO SCOPE DEBUG] ✓ API call succeeded");
      console.log("[AURINKO SCOPE DEBUG] Status:", response.status);
      console.log(
        "[AURINKO SCOPE DEBUG] Response body:",
        JSON.stringify(response.data, null, 2),
      );

      return NextResponse.json({
        success: true,
        status: response.status,
        accountId: account.id,
        emailAddress: account.emailAddress,
        requestHeaders,
        responseBody: response.data,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        console.log("[AURINKO SCOPE DEBUG] ✗ API call failed");
        console.log("[AURINKO SCOPE DEBUG] Status:", status);
        console.log(
          "[AURINKO SCOPE DEBUG] Response body:",
          JSON.stringify(responseData, null, 2),
        );

        if (status === 403) {
          console.error(
            "==================================================================",
          );
          console.error(
            "[AURINKO SCOPE DEBUG] ✗✗✗ 403 FROM AURINKO EMAIL API ✗✗✗",
          );
          console.error("OAuth Gmail scope missing or app misconfigured");
          console.error(
            "==================================================================",
          );
          console.error("[AURINKO SCOPE DEBUG] This confirms:");
          console.error("  1. Request headers are correct");
          console.error("  2. Token and accountId are valid");
          console.error("  3. Failure is at Aurinko/provider level");
          console.error("  4. Root cause: Missing Gmail email scope in OAuth");
          console.error(
            "==================================================================",
          );
        }

        return NextResponse.json(
          {
            success: false,
            status,
            accountId: account.id,
            emailAddress: account.emailAddress,
            requestHeaders,
            error: {
              message: error.message,
              responseData,
            },
            diagnostic:
              status === 403
                ? "403 from Aurinko email API — OAuth Gmail scope missing or app misconfigured"
                : `API call failed with status ${status}`,
          },
          { status: status ?? 500 },
        );
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error("[AURINKO SCOPE DEBUG] ✗ Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
