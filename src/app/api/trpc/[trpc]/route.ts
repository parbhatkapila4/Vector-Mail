import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const createContext = async (req: NextRequest) => {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  return createTRPCContext({
    headers,
  });
};

const handler = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
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
  });

export { handler as GET, handler as POST };
