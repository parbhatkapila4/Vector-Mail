import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  backfillEmailAnalysis,
  getEmailsNeedingAnalysisCount,
} from "@/lib/backfill-email-analysis";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { accountId, limit = 50 } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { message: "Account ID required" },
        { status: 400 },
      );
    }

    // Verify account belongs to user
    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 },
      );
    }

    // Run backfill
    const result = await backfillEmailAnalysis(accountId, limit);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in backfill API:", error);
    return NextResponse.json(
      { message: "Failed to backfill email analysis", error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = req.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { message: "Account ID required" },
        { status: 400 },
      );
    }

    // Verify account belongs to user
    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 },
      );
    }

    const count = await getEmailsNeedingAnalysisCount(accountId);

    return NextResponse.json({
      accountId,
      emailsNeedingAnalysis: count,
    });
  } catch (error) {
    console.error("Error in backfill count API:", error);
    return NextResponse.json(
      { message: "Failed to get count", error: String(error) },
      { status: 500 },
    );
  }
}
