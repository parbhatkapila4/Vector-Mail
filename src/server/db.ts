import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = () => {
  if (!env.DATABASE_URL) {
    // Return a mock client when DATABASE_URL is not provided
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
      // Add other methods as needed
    } as any;
  }
  
  return new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
