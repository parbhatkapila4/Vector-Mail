import { db, withDbRetry } from "@/server/db";
import { makeTagLogger } from "@/lib/logging/console-shim";

const guardLog = makeTagLogger("auth.connected-account");
export async function hasConnectedAccount(
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId?.trim()) return false;

  try {
    const account = await withDbRetry(() =>
      db.account.findFirst({
        where: { userId },
        select: { id: true },
      }),
    );
    return account !== null;
  } catch (error) {
    guardLog.error("connected-account lookup failed, denying access", error);
    return false;
  }
}
