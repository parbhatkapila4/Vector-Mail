import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cache } from "@/lib/cache";
import { makeTagLogger } from "@/lib/logging/console-shim";
const apiLog = makeTagLogger("api.metrics");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !isAdmin(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheStats = cache.getStats();

    const metrics = {
      timestamp: new Date().toISOString(),
      cache: {
        size: cacheStats.size,
        keys: cacheStats.keys.length,
      },
      process:
        typeof process !== "undefined"
          ? {
              memory: process.memoryUsage(),
              uptime: process.uptime(),
            }
          : null,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    apiLog.error("Failed to get metrics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 },
    );
  }
}

function isAdmin(userId: string): boolean {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(",") || [];
  return adminUsers.includes(userId);
}
