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
      : user.userId
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

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === "UNAUTHORIZED") {
    } else {
      console.error(`[TRPC Error] ${error.code}:`, error.message);
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

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

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
