import { z } from "zod";

import { protectedProcedure } from "@/server/api/trpc";
import { Account } from "@/lib/accounts";
import { isDemoCall } from "@/lib/demo/predicate";
import { getDemoEmailBody } from "@/lib/demo/seed-demo-data";
import { makeTagLogger } from "@/lib/logging/console-shim";

import { authoriseAccountAccess } from "./shared";

const readingLog = makeTagLogger("account-router.email-reading");

export const emailReadingProcedures = {
  getEmailBody: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        emailId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (isDemoCall(ctx, input.accountId)) {
        const demo = getDemoEmailBody(input.emailId);
        if (!demo) return { body: null, cached: false };
        return { body: demo.body ?? demo.bodySnippet, cached: true };
      }
      try {
        const account = await authoriseAccountAccess(
          input.accountId,
          ctx.auth.userId,
        );
        const emailAccount = new Account(account.id, account.token);

        const existingEmail = await ctx.db.email.findUnique({
          where: { id: input.emailId },
          select: {
            id: true,
            body: true,
            bodySnippet: true,
            thread: {
              select: {
                accountId: true,
              },
            },
          },
        });

        if (!existingEmail || existingEmail.thread.accountId !== account.id) {
          readingLog.warn(`Email not found: ${input.emailId}`);
          return {
            body: existingEmail?.bodySnippet || null,
            cached: false,
          };
        }

        const isPlainText =
          existingEmail.body &&
          existingEmail.body.length > 100 &&
          !/<[^>]+>/g.test(existingEmail.body);

        const hasUnresolvedCid =
          existingEmail.body && /cid:/i.test(existingEmail.body);

        const looksLikeStrippedMetadata =
          existingEmail.body && /\[image:\s*[^\]]*\]/i.test(existingEmail.body);

        if (
          existingEmail.body &&
          existingEmail.body.length > 100 &&
          !isPlainText &&
          !hasUnresolvedCid &&
          !looksLikeStrippedMetadata
        ) {
          return {
            body: existingEmail.body,
            cached: true,
          };
        }

        try {
          const fullEmail = await emailAccount.getEmailById(input.emailId);

          if (fullEmail?.body && fullEmail.body.trim().length > 0) {
            let bodyToReturn = fullEmail.body;


            if (
              fullEmail.attachments?.length > 0 &&
              typeof bodyToReturn === "string"
            ) {
              for (const att of fullEmail.attachments) {
                if (
                  att.inline &&
                  att.contentId &&
                  att.content &&
                  att.mimeType
                ) {
                  const cidClean = att.contentId.replace(/^<|>$/g, "").trim();
                  if (!cidClean) continue;
                  const dataUrl = `data:${att.mimeType};base64,${att.content}`;
                  const escapedCid = cidClean.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                  );
                  const cidRegex = new RegExp(
                    `cid:<?${escapedCid}>?`,
                    "gi",
                  );
                  bodyToReturn = bodyToReturn.replace(cidRegex, dataUrl);
                }
              }
            }

            ctx.db.email
              .update({
                where: { id: input.emailId },
                data: {
                  body: bodyToReturn,
                },
              })
              .catch((updateError) => {
                readingLog.error(
                  `Failed to update email body in DB: ${input.emailId}`,
                  updateError,
                );
              });

            return {
              body: bodyToReturn,
              cached: false,
            };
          } else {
            readingLog.warn(`Email body is empty for: ${input.emailId}`);
            return {
              body: existingEmail.body || existingEmail.bodySnippet || null,
              cached: true,
            };
          }
        } catch (fetchError) {
          readingLog.error(
            `Failed to fetch email body from API: ${input.emailId}`,
            fetchError,
          );
          return {
            body: existingEmail.body || existingEmail.bodySnippet || null,
            cached: true,
          };
        }
      } catch (error) {
        readingLog.error(`Error in getEmailBody for ${input.emailId}:`, error);
        return {
          body: null,
          cached: false,
        };
      }
    }),

  getEmailOpenByMessageId: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await authoriseAccountAccess(input.accountId, ctx.auth.userId);
      const open = await ctx.db.emailOpen.findFirst({
        where: {
          messageId: input.messageId,
          accountId: input.accountId,
        },
        select: { openedAt: true },
      });
      if (!open?.openedAt) return null;
      return { openedAt: open.openedAt };
    }),
};
