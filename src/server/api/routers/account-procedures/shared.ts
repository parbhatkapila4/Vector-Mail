import { db, withDbRetry } from "@/server/db";

export interface AccountAccess {
  id: string;
  emailAddress: string;
  name: string;
  token: string;
  nextDeltaToken: string | null;
  needsReconnection: boolean;
  tokenExpiresAt: Date | null;
}

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
): Promise<AccountAccess> => {
  const account = await withDbRetry(() =>
    db.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
        token: true,
        nextDeltaToken: true,
        needsReconnection: true,
        tokenExpiresAt: true,
      },
    }),
  );

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
};
