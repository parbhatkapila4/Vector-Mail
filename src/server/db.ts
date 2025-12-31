import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure Prisma with connection pool settings
// This prevents "connection closed" errors by properly managing the connection pool
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Connection pool is managed via DATABASE_URL connection string parameters:
    // ?connection_limit=10&pool_timeout=20 (configure in .env if needed)
    // Default Prisma pool size is 10 connections which should be sufficient with reduced concurrency
  });

/**
 * Wrapper function to retry database operations on connection errors
 * This helps handle transient connection issues with Neon
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delay = 500,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isConnectionError =
        errorMessage.includes("Closed") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("P1001"); // Prisma connection error code

      if (isConnectionError && attempt < maxRetries - 1) {
        console.warn(
          `[Prisma] Connection error (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Ensure connections are properly managed
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} else {
  // In production, ensure graceful shutdown
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}
