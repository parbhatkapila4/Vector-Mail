import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getRequestId } from "@/lib/correlation";
import { serverLog } from "@/lib/logging/server-logger";
import { db } from "@/server/db";
import { auth, getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { getDemoCookie } from "@/lib/demo/is-demo-mode";
import { DEMO_USER_ID } from "@/lib/demo/constants";

const SESSION_COOKIE = "vectormail_session_user";

function getSessionCookieUserId(req: Request | undefined): string | null {
  if (!req) return null;
  const nextReq = req as NextRequest;
  const cookie = nextReq.cookies?.get?.(SESSION_COOKIE)?.value;
  return cookie?.trim() ?? null;
}

export const createTRPCContext = async (opts: {
  headers: Headers;
  req?: Request;
}) => {
  const user = opts.req
    ? await getAuth(opts.req as Parameters<typeof getAuth>[0])
    : await auth();
  const cookieUserId = getSessionCookieUserId(opts.req);
  const demoCookie = getDemoCookie(opts.req);
  const isDemo = demoCookie === "1" || cookieUserId === DEMO_USER_ID;
  const effectiveAuth =
    isDemo
      ? { ...user, userId: DEMO_USER_ID }
      : user?.userId
        ? user
        : cookieUserId
          ? { ...user, userId: cookieUserId }
          : user;
  const requestId = getRequestId();
  return {
    db,
    auth: effectiveAuth,
    requestId,
    log: serverLog,
    headers: opts.headers,
  };
};

function isClientAbortError(error: { message?: string; cause?: unknown }): boolean {
  const msg = error.message ?? "";
  if (/Unexpected end of JSON input/i.test(msg)) return true;
  if (/Unexpected token .* JSON/i.test(msg)) return true;
  if (
    typeof error.cause === "object" &&
    error.cause !== null &&
    "message" in error.cause &&
    typeof (error.cause as { message: unknown }).message === "string" &&
    /Unexpected end of JSON input/i.test(
      (error.cause as { message: string }).message,
    )
  ) {
    return true;
  }
  return false;
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === "UNAUTHORIZED") {
    } else if (isClientAbortError(error)) {
      serverLog.warn(
        { code: error.code, message: error.message },
        "trpc: client aborted request before body finished",
      );
    } else {
      serverLog.error(
        { code: error.code, message: error.message, stack: error.stack },
        "trpc: procedure failed",
      );
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export { isClientAbortError };

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  serverLog.debug({ path, durationMs: end - start }, "trpc: procedure timing");

  return result;
});

const isAuth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please sign in to continue",
    });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth as Required<typeof ctx.auth>,
    },
  });
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(isAuth);

function isAdminUserId(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  const adminUsers = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return adminUsers.includes(userId);
}

const isAdmin = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.auth.userId;
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please sign in to continue",
    });
  }
  if (!isAdminUserId(userId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin only",
    });
  }
  return next();
});
export const adminProcedure = protectedProcedure.use(isAdmin);
