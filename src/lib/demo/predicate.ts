import { DEMO_ACCOUNT_ID, DEMO_USER_ID } from "./constants";

type AuthShape = { userId: string | null | undefined };
type CtxShape = { auth: AuthShape };

export function isDemoCall(ctx: CtxShape, accountId?: string | null): boolean {
  if (ctx.auth.userId !== DEMO_USER_ID) return false;
  if (accountId == null) return true;
  return accountId === DEMO_ACCOUNT_ID;
}

export function isDemoCallFor<T>(
  ctx: CtxShape,
  input: T,
  match: (input: T) => boolean,
): boolean {
  if (ctx.auth.userId !== DEMO_USER_ID) return false;
  return match(input);
}
