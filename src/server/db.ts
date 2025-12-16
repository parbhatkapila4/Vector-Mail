import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = (): PrismaClient => {
  if (!env.DATABASE_URL) {
    return {
      $connect: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
    } as unknown as PrismaClient;
  }

  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
