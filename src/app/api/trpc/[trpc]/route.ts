import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import {
  getOrCreateRequestId,
  runWithRequestIdAsync,
  REQUEST_ID_HEADER,
} from "@/lib/correlation";
import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const runtime = "nodejs";

const createContext = async (req: NextRequest) => {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  return createTRPCContext({
    headers,
    req,
  });
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
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
            if (error.cause) {
              console.error("Error cause:", error.cause);
            }
            if (error.stack) {
              console.error("Error stack:", error.stack);
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
