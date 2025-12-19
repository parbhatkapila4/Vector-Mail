import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Account } from "@/lib/accounts";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const maxResults = Math.min(
      parseInt(searchParams.get("maxResults") || "50", 10),
      100,
    );

    const account = await db.account.findFirst({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountId = account.id;
    console.log("[Inbox API] Server-derived accountId:", accountId);

    const emailAccount = new Account(account.id, account.token);

    try {
      const result = await emailAccount.fetchInboxEmails();

      console.log("INBOX DB QUERY RESULT COUNT:", result.emails.length);

      const messages =
        maxResults > 0 ? result.emails.slice(0, maxResults) : result.emails;

      return NextResponse.json(
        {
          messages,
          nextCursor: undefined,
        },
        {
          headers: {
            "Cache-Control": "private, max-age=60",
          },
        },
      );
    } catch (error) {
      console.error("[Inbox API] Aurinko fetch failed:", error);

      const dbEmails = await db.email.findMany({
        where: {
          thread: {
            accountId: account.id,
            inboxStatus: true,
          },
        },
        include: {
          from: true,
        },
        orderBy: {
          sentAt: "desc",
        },
        take: maxResults,
      });

      const fallbackMessages = dbEmails.map((email) => ({
        id: email.id,
        from: {
          name: email.from.name,
          address: email.from.address,
        },
        subject: email.subject || "(No subject)",
        date: email.sentAt.toISOString(),
        snippet: email.bodySnippet || email.body?.substring(0, 200) || "",
      }));

      return NextResponse.json({
        messages: fallbackMessages,
        nextCursor: undefined,
        fallback: true,
      });
    }
  } catch (error) {
    console.error("[Inbox API] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch inbox",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
