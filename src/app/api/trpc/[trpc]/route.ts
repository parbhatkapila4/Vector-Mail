import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import axios from "axios";

import {
  getOrCreateRequestId,
  runWithRequestIdAsync,
  REQUEST_ID_HEADER,
} from "@/lib/correlation";
import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext, isClientAbortError } from "@/server/api/trpc";
import { makeTagLogger } from "@/lib/logging/console-shim";

const trpcLog = makeTagLogger("api.trpc-handler");

export const runtime = "nodejs";
export const maxDuration = 120;

const createContext = async (req: NextRequest) => {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    headers.set(key, value);
  });
  return createTRPCContext({ headers, req });
};

const handler = async (req: NextRequest) => {
  const requestId = getOrCreateRequestId(req.headers);
  const response = await runWithRequestIdAsync(requestId, () =>
    fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => createContext(req),
      onError:
        env.NODE_ENV === "development"
          ? ({ path, error }) => {
            if (error.code === "UNAUTHORIZED") {
              return;
            }
            if (isClientAbortError(error)) {
              trpcLog.warn(
                `tRPC client aborted ${path ?? "<no-path>"} before body finished`,
              );
              return;
            }
            trpcLog.error(
              `tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
            if (error.cause) {
              const c = error.cause;
              if (axios.isAxiosError(c)) {
                trpcLog.error(
                  "Error cause (Axios):",
                  c.code,
                  c.message,
                  c.config?.method,
                  c.config?.url,
                );
              } else if (c instanceof Error) {
                trpcLog.error("Error cause:", c.message);
              }
            }
            if (error.stack) {
              trpcLog.error("Error stack:", error.stack);
            }
          }
          : undefined,
    }),
  );
  if (response && !response.headers.has(REQUEST_ID_HEADER)) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set(REQUEST_ID_HEADER, requestId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  return response;
};

export { handler as GET, handler as POST };
