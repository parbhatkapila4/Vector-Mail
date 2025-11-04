import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";
import { Account } from "@/lib/accounts";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";

export async function POST(req: NextRequest) {
  const { userId, accountId } = await req.json();
  if (!userId || !accountId) {
    return NextResponse.json(
      { message: "Missing userId or accountId" },
      { status: 400 },
    );
  }
  const dbAccount = await db.account.findUnique({
    where: { id: accountId, userId: userId },
  });
  if (!dbAccount) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
  const account = new Account(dbAccount.token);

  const response = await account.performInitialSync();

  if (!response) {
    return NextResponse.json(
      { message: "Failed to perform initial sync" },
      { status: 500 },
    );
  }

  const { emails, deltaToken } = response;

  await db.account.update({
    where: { id: accountId },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncEmailsToDatabase(emails, accountId);

  return NextResponse.json(
    { message: "Initial sync completed" },
    { status: 200 },
  );
}
