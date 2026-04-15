import { createActionExecution } from "@/lib/automation";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const automationRouter = createTRPCRouter({
  createDryRunExecution: adminProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        threadId: z.string().min(1).optional(),
        idempotencyKey: z.string().min(1).max(512),
        type: z.string().min(1).max(128),
        payload: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const account = await db.account.findFirst({
        where: { id: input.accountId, userId },
        select: { id: true, automationMode: true },
      });
      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }
      try {
        return await createActionExecution({
          userId,
          accountId: input.accountId,
          threadId: input.threadId,
          type: input.type,
          modeSnapshot: account.automationMode,
          payload: (input.payload ?? {}) as Prisma.InputJsonValue,
          idempotencyKey: input.idempotencyKey,
          dryRun: true,
        });
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to create execution";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg,
        });
      }
    }),
});
