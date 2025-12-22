import { db } from "@/server/db";
import { analyzeEmail } from "./email-analysis";
import type { EmailMessage } from "@/types";
import { Prisma } from "@prisma/client";

export async function processExistingEmails(
  accountId?: string,
  batchSize: number = 10,
) {
  try {
    console.log("Starting to process existing emails with AI analysis...");

    let processed = 0;
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      const emailIds = accountId
        ? ((await db.$queryRaw<Array<{ id: string }>>`
            SELECT e.id
            FROM "Email" e
            JOIN "Thread" t ON e."threadId" = t.id
            WHERE t."accountId" = ${accountId}
              AND (e."summary" IS NULL OR e."embedding" IS NULL)
            ORDER BY e."sentAt" DESC
            LIMIT ${batchSize}
          `) as Array<{ id: string }>)
        : ((await db.$queryRaw<Array<{ id: string }>>`
            SELECT e.id
            FROM "Email" e
            WHERE e."summary" IS NULL OR e."embedding" IS NULL
            ORDER BY e."sentAt" DESC
            LIMIT ${batchSize}
          `) as Array<{ id: string }>);

      if (emailIds.length === 0) {
        hasMore = false;
        break;
      }

      const emailIdList = emailIds.map((e) => e.id);

      const emails = await db.email.findMany({
        where: {
          id: { in: emailIdList },
        },
        include: {
          thread: true,
          from: true,
          to: true,
          cc: true,
          bcc: true,
          replyTo: true,
          attachments: true,
        },
        orderBy: {
          sentAt: "desc",
        },
      });

      if (emails.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`Processing batch of ${emails.length} emails...`);

      for (const email of emails) {
        try {
          const emailMessage: EmailMessage = {
            id: email.id,
            threadId: email.threadId,
            createdTime: email.createdTime.toISOString(),
            lastModifiedTime: email.lastModifiedTime.toISOString(),
            sentAt: email.sentAt.toISOString(),
            receivedAt: email.receivedAt.toISOString(),
            internetMessageId: email.internetMessageId,
            subject: email.subject,
            sysLabels: email.sysLabels as EmailMessage["sysLabels"],
            keywords: email.keywords,
            sysClassifications:
              email.sysClassifications as EmailMessage["sysClassifications"],
            sensitivity: email.sensitivity as EmailMessage["sensitivity"],
            meetingMessageMethod:
              email.meetingMessageMethod as EmailMessage["meetingMessageMethod"],
            from: {
              address: email.from.address,
              name: email.from.name || "",
            },
            to: email.to.map((t) => ({
              address: t.address,
              name: t.name || "",
            })),
            cc: email.cc.map((c) => ({
              address: c.address,
              name: c.name || "",
            })),
            bcc: email.bcc.map((b) => ({
              address: b.address,
              name: b.name || "",
            })),
            replyTo: email.replyTo.map((r) => ({
              address: r.address,
              name: r.name || "",
            })),
            hasAttachments: email.hasAttachments,
            body: email.body || undefined,
            bodySnippet: email.bodySnippet || undefined,
            attachments: email.attachments.map((a) => ({
              id: a.id,
              name: a.name,
              mimeType: a.mimeType,
              size: a.size,
              inline: a.inline,
              contentId: a.contentId || undefined,
              content: a.content || undefined,
              contentLocation: a.contentLocation || undefined,
            })),
            inReplyTo: email.inReplyTo || undefined,
            references: email.references || undefined,
            threadIndex: email.threadIndex || undefined,
            internetHeaders:
              email.internetHeaders as unknown as EmailMessage["internetHeaders"],
            nativeProperties:
              email.nativeProperties as EmailMessage["nativeProperties"],
            folderId: email.folderId || undefined,
            omitted: email.omitted as EmailMessage["omitted"],
          };

          console.log(`Analyzing email: ${email.subject}`);
          const analysis = await analyzeEmail(emailMessage);

          await db.$executeRaw`
            UPDATE "Email" 
            SET 
                "summary" = ${analysis.summary},
                "keywords" = ${JSON.stringify(analysis.tags)}::text[],
                "embedding" = ${JSON.stringify(analysis.vectorEmbedding)}::vector
            WHERE id = ${email.id}
          `;

          processed++;
          totalProcessed++;

          console.log(
            `✓ Processed email: ${email.subject} (${totalProcessed} total)`,
          );

          if (processed % 5 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
        }
      }

      console.log(`Completed batch. Total processed: ${totalProcessed}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(
      `Finished processing emails. Total processed: ${totalProcessed}`,
    );
    return { success: true, totalProcessed };
  } catch (error) {
    console.error("Error processing existing emails:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getEmailProcessingStats(accountId?: string) {
  try {
    let whereClause: Prisma.EmailWhereInput = {};
    if (accountId) {
      whereClause = {
        thread: {
          accountId: accountId,
        },
      };
    }

    const totalEmails = await db.email.count({ where: whereClause });

    const emailsWithAnalysisResult = accountId
      ? await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM "Email" e
          JOIN "Thread" t ON e."threadId" = t.id
          WHERE t."accountId" = ${accountId}
            AND e."summary" IS NOT NULL
            AND e."embedding" IS NOT NULL
        `
      : await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM "Email" e
          WHERE e."summary" IS NOT NULL
            AND e."embedding" IS NOT NULL
        `;
    const emailsWithAnalysis = Number(emailsWithAnalysisResult[0]?.count || 0);

    const emailsNeedingAnalysis = totalEmails - emailsWithAnalysis;

    return {
      totalEmails,
      emailsWithAnalysis,
      emailsNeedingAnalysis,
      percentageComplete:
        totalEmails > 0
          ? Math.round((emailsWithAnalysis / totalEmails) * 100)
          : 0,
    };
  } catch (error) {
    console.error("Error getting email processing stats:", error);
    return null;
  }
}
