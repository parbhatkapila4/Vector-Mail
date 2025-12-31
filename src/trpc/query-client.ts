import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        // Suppress console errors for UNAUTHORIZED errors
        onError: (error) => {
          // Check if it's a tRPC error with UNAUTHORIZED code
          const trpcError = error as { code?: string; data?: { code?: string } };
          if (trpcError.code === "UNAUTHORIZED" || trpcError.data?.code === "UNAUTHORIZED") {
            // Don't log UNAUTHORIZED errors - these are expected when user is not logged in
            return;
          }
          // Log other errors normally
          console.error("[React Query Error]:", error);
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
