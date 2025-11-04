import { db } from "@/server/db";
import { analyzeEmail } from "./email-analysis";
import { EmailMessage } from "@/types";

/**
 * Process existing emails to add AI analysis
 * This should be run once to backfill existing emails with AI analysis
 */
export async function processExistingEmails(
  accountId?: string,
  batchSize: number = 10,
) {
  try {
    console.log("Starting to process existing emails with AI analysis...");

    let whereClause: any = {
      OR: [
        { aiSummary: null },
        { vectorEmbedding: null },
        { vectorEmbedding: { isEmpty: true } },
      ],
    };

    if (accountId) {
      whereClause = {
        AND: [
          whereClause,
          {
            thread: {
              accountId: accountId,
            },
          },
        ],
      };
    }

    let processed = 0;
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      // Get a batch of emails that need AI analysis
      const emails = await db.email.findMany({
        where: whereClause,
        include: {
          thread: true,
          from: true,
          to: true,
          cc: true,
          attachments: true,
        },
        take: batchSize,
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
          // Convert database email to EmailMessage format for analysis
          const emailMessage: EmailMessage = {
            id: email.id,
            threadId: email.threadId,
            createdTime: email.createdTime.toISOString(),
            lastModifiedTime: email.lastModifiedTime.toISOString(),
            sentAt: email.sentAt.toISOString(),
            receivedAt: email.receivedAt.toISOString(),
            internetMessageId: email.internetMessageId,
            subject: email.subject,
            sysLabels: email.sysLabels as any[],
            keywords: email.keywords,
            sysClassifications: email.sysClassifications as any[],
            sensitivity: email.sensitivity as any,
            meetingMessageMethod: email.meetingMessageMethod as any,
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
            internetHeaders: email.internetHeaders as any[],
            nativeProperties: email.nativeProperties as any,
            folderId: email.folderId || undefined,
            omitted: email.omitted,
          };

          // Generate AI analysis
          console.log(`Analyzing email: ${email.subject}`);
          const analysis = await analyzeEmail(emailMessage);

          // Update the email with AI analysis using raw SQL
          await db.$executeRaw`
            UPDATE "Email" 
            SET 
                "aiSummary" = ${analysis.summary},
                "aiTags" = ${analysis.tags},
                "vectorEmbedding" = ${JSON.stringify(analysis.vectorEmbedding)}::vector
            WHERE id = ${email.id}
          `;

          processed++;
          totalProcessed++;

          console.log(
            `✓ Processed email: ${email.subject} (${totalProcessed} total)`,
          );

          // Add a small delay to avoid overwhelming the AI service
          if (processed % 5 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
          // Continue with next email
        }
      }

      console.log(`Completed batch. Total processed: ${totalProcessed}`);

      // Add delay between batches
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(
      `Finished processing emails. Total processed: ${totalProcessed}`,
    );
    return { success: true, totalProcessed };
  } catch (error) {
    console.error("Error processing existing emails:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get statistics about email processing status
 */
export async function getEmailProcessingStats(accountId?: string) {
  try {
    let whereClause: any = {};
    if (accountId) {
      whereClause = {
        thread: {
          accountId: accountId,
        },
      };
    }

    const totalEmails = await db.email.count({ where: whereClause });

    const emailsWithAnalysis = await db.email.count({
      where: {
        AND: [
          whereClause,
          {
            aiSummary: { not: null },
            vectorEmbedding: { not: null },
          },
        ],
      },
    });

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
