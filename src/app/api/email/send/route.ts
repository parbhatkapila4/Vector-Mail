import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import axios from "axios";

export async function POST(req: NextRequest) {
  
  const enableEmailSend =
    env.ENABLE_EMAIL_SEND ??
    process.env.ENABLE_EMAIL_SEND === "true";

  if (!enableEmailSend) {
    console.log(
      "[EMAIL_SEND] Feature disabled - ENABLE_EMAIL_SEND:",
      process.env.ENABLE_EMAIL_SEND,
      "env.ENABLE_EMAIL_SEND:",
      env.ENABLE_EMAIL_SEND,
    );
    return NextResponse.json(
      {
        error: "Email sending is disabled",
        message:
          "ENABLE_EMAIL_SEND is set to false. Please set ENABLE_EMAIL_SEND=true in your .env file and restart the server.",
      },
      { status: 403 },
    );
  }

  
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to send emails" },
      { status: 401 },
    );
  }

  
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request",
        message: "Request body must be valid JSON",
      },
      { status: 400 },
    );
  }

  const { accountId, to, subject, body: emailBody, cc, bcc } = body;

  
  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json(
      { error: "Invalid accountId", message: "accountId is required" },
      { status: 400 },
    );
  }

  if (!to || !Array.isArray(to) || to.length === 0) {
    return NextResponse.json(
      { error: "Invalid recipients", message: "At least one 'to' recipient is required" },
      { status: 400 },
    );
  }

  if (!subject || typeof subject !== "string") {
    return NextResponse.json(
      { error: "Invalid subject", message: "subject is required" },
      { status: 400 },
    );
  }

  if (!emailBody || typeof emailBody !== "string") {
    return NextResponse.json(
      { error: "Invalid body", message: "body is required" },
      { status: 400 },
    );
  }

  
  let account;
  try {
    account = await db.account.findFirst({
      where: {
        id: accountId,
        userId, 
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
        token: true,
        provider: true,
      },
    });
  } catch (error) {
    console.error("[EMAIL_SEND] Database error:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: "Failed to retrieve account information",
      },
      { status: 500 },
    );
  }

  if (!account) {
    return NextResponse.json(
      {
        error: "Account not found",
        message: "Account not found or you don't have access to it",
      },
      { status: 404 },
    );
  }

  
  const fromEmail = account.emailAddress;
  const fromName = account.name || account.emailAddress;

  
  try {
    const aurinkoHeaders = {
      Authorization: `Bearer ${account.token}`,
      "X-Aurinko-Account-Id": account.id,
      "Content-Type": "application/json",
    };

    const emailPayload = {
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: to.map((email: string) => ({
        address: email,
        name: email,
      })),
      subject: subject,
      body: emailBody,
      cc: cc
        ? cc.map((email: string) => ({
            address: email,
            name: email,
          }))
        : undefined,
      bcc: bcc
        ? bcc.map((email: string) => ({
            address: email,
            name: email,
          }))
        : undefined,
    };

    console.log("[EMAIL_SEND] Sending email via Aurinko API");
    console.log("[EMAIL_SEND] From:", fromEmail);
    console.log("[EMAIL_SEND] To:", to);
    console.log("[EMAIL_SEND] Subject:", subject);

    const response = await axios.post(
      `https://api.aurinko.io/v1/email/messages`,
      emailPayload,
      {
        params: {
          returnIds: true,
        },
        headers: aurinkoHeaders,
      },
    );

    console.log("[EMAIL_SEND] Success - Response:", response.data);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        messageId: response.data.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[EMAIL_SEND] Error sending email:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      console.error("[EMAIL_SEND] Axios error - Status:", status);
      console.error("[EMAIL_SEND] Axios error - Data:", errorData);

      if (status === 401) {
        return NextResponse.json(
          {
            error: "Invalid token",
            message:
              "The authentication token is invalid or expired. Please reconnect your account.",
            details: errorData,
          },
          { status: 401 },
        );
      }

      if (status === 403) {
        return NextResponse.json(
          {
            error: "Permission denied",
            message:
              "The account does not have permission to send emails. Please check your account permissions.",
            details: errorData,
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: "Email sending failed",
          message: "Failed to send email via Aurinko API",
          details: errorData || error.message,
          status: status,
        },
        { status: status || 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Unknown error",
        message: "An unexpected error occurred while sending the email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
