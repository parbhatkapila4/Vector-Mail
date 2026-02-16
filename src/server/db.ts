import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const originalStdErr = process.stderr.write.bind(process.stderr);

process.stderr.write = ((chunk: unknown, encoding?: BufferEncoding, callback?: () => void) => {
  let chunkString: string;
  if (typeof chunk === "string") {
    chunkString = chunk;
  } else if (Buffer.isBuffer(chunk)) {
    chunkString = chunk.toString("utf-8");
  } else {
    chunkString = String(chunk);
  }

  const isPrismaConnectionError =
    chunkString.includes("prisma:error") &&
    (chunkString.includes("Error in PostgreSQL connection") ||
      chunkString.includes("PostgreSQL connection") ||
      chunkString.includes("kind: Closed") ||
      chunkString.includes("kind:Closed") ||
      (chunkString.includes("Closed") && chunkString.includes("cause: None")));

  if (isPrismaConnectionError) {
    if (typeof callback === "function") {
      callback();
    }
    return true;
  }

  return originalStdErr(chunk as string | Uint8Array, encoding, callback);
}) as typeof process.stderr.write;

const originalConsoleError = console.error.bind(console);
console.error = ((...args: unknown[]) => {
  const message = args
    .map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");

  const isPrismaConnectionError =
    message.includes("prisma:error") &&
    (message.includes("Error in PostgreSQL connection") ||
      message.includes("PostgreSQL connection") ||
      message.includes("kind: Closed") ||
      message.includes("kind:Closed") ||
      (message.includes("Closed") && message.includes("cause: None")));

  if (isPrismaConnectionError) {
    return;
  }
  return originalConsoleError(...args);
}) as typeof console.error;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn"] : [],
  });

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 500,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorString = String(error).toLowerCase();
      const errorObj = error as { kind?: string; cause?: unknown };
      const isConnectionError =
        errorMessage.includes("Closed") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("P1001") ||
        errorMessage.includes("P1017") ||
        errorString.includes("kind: closed") ||
        errorString.includes("connection closed") ||
        (errorObj.kind && String(errorObj.kind).toLowerCase() === "closed");

      if (isConnectionError && attempt < maxRetries - 1) {
        const retryDelay = delay * (attempt + 1);
        console.warn(
          `[Prisma] Connection error (attempt ${attempt + 1}/${maxRetries}), retrying in ${retryDelay}ms...`,
          errorMessage,
        );

        try {
          await db.$connect();
        } catch { }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} else {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}
