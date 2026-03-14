import { db } from "@/server/db";
import type { EmailAddress, EmailAttachment, EmailMessage } from "@/types";
import type { Prisma } from "@prisma/client";

function safeDate(value: unknown): Date {
  if (value == null) return new Date();
  const d = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function normalizeEmailAddressString(addr: string, raw?: string | null): string | null {
  const fromRaw = raw?.trim();
  if (fromRaw) {
    const angleMatch = fromRaw.match(/<([^>]+)>/);
    if (angleMatch?.[1]) {
      const extracted = angleMatch[1].trim().toLowerCase();
      if (extracted.includes("@")) return extracted;
    }
  }
  const s = (addr ?? "").trim();
  if (!s) return null;
  const fixed = s.replace(/\s+@/, "@").toLowerCase();
  return fixed.includes("@") ? fixed : null;
}

async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  concurrency: number = 5,
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    batches.push(items.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(processor));
  }
}

export async function syncEmailsToDatabase(
  emails: EmailMessage[],
  accountId: string,
  options?: { writeConcurrency?: number; skipRecalculate?: boolean },
) {
  if (!emails || emails.length === 0) {
    console.warn(
      `[syncEmailsToDatabase] No emails provided for account ${accountId}`,
    );
    return;
  }

  const accountExists = await db.account.findUnique({
    where: { id: accountId },
    select: { id: true },
  });
  if (!accountExists) {
    console.error(`[sync] Account ${accountId} not found in DB - skipping sync (foreign key would fail).`);
    return;
  }

  const concurrency = options?.writeConcurrency ?? 5;
  const skipRecalculate = options?.skipRecalculate === true;

  let successCount = 0;
  let errorCount = 0;

  try {
    await processBatch(
      emails,
      async (email) => {
        try {
          await upsertEmail(email, accountId);
          successCount++;
        } catch (error) {
          errorCount++;
          if (errorCount === 1) {
            console.error(
              `[sync] First upsert failure (${emails.length} emails in batch):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      },
      concurrency,
    );

    if (!skipRecalculate) {
      await recalculateAllThreadStatuses(accountId);
    }

    console.log(
      `[sync] Account ${accountId}: ${emails.length} emails → saved ${successCount}${errorCount > 0 ? `, ${errorCount} errors` : ""}`,
    );
  } catch (error) {
    console.error(
      `[syncEmailsToDatabase] Fatal sync error for account ${accountId}:`,
      error,
    );
    throw error;
  }
}

export async function recalculateAllThreadStatuses(accountId: string) {
  try {
    const threads = await db.thread.findMany({
      where: { accountId },
      select: { id: true },
    });

    let inboxCount = 0;
    let sentCount = 0;
    let draftCount = 0;

    for (const thread of threads) {
      const threadEmails = await db.email.findMany({
        where: { threadId: thread.id },
        select: {
          emailLabel: true,
          sysLabels: true,
          sysClassifications: true,
          sentAt: true,
          receivedAt: true,
          createdTime: true,
        },
      });

      let hasInboxEmail = false;
      let hasDraftEmail = false;
      let hasSentEmail = false;
      let hasTrashEmail = false;

      for (const threadEmail of threadEmails) {

        if (
          threadEmail.emailLabel === "draft" ||
          threadEmail.sysLabels?.includes("draft")
        ) {
          hasDraftEmail = true;
          break;
        }

        if (threadEmail.sysLabels?.includes("trash")) {
          hasTrashEmail = true;
        }

        const hasInboxLabel =
          threadEmail.emailLabel === "inbox" ||
          threadEmail.sysLabels?.includes("inbox") ||
          threadEmail.sysLabels?.includes("unread") ||
          threadEmail.sysLabels?.includes("important") ||
          threadEmail.sysLabels?.includes("starred") ||
          threadEmail.sysLabels?.includes("flagged") ||
          threadEmail.sysLabels?.includes("spam") ||
          threadEmail.sysLabels?.includes("junk") ||
          threadEmail.sysClassifications?.includes("promotions") ||
          threadEmail.sysClassifications?.includes("social") ||
          threadEmail.sysClassifications?.includes("updates") ||
          threadEmail.sysClassifications?.includes("forums");

        if (hasInboxLabel) {
          hasInboxEmail = true;
        }



        const isSent =
          (threadEmail.emailLabel === "sent" ||
            threadEmail.sysLabels?.includes("sent")) &&
          !threadEmail.sysLabels?.includes("draft");

        if (isSent) {
          hasSentEmail = true;
        }


        const isInbox =
          threadEmail.emailLabel === "inbox" ||
          threadEmail.sysLabels?.includes("inbox") ||
          threadEmail.sysLabels?.includes("unread") ||
          threadEmail.sysLabels?.includes("important");

        if (isInbox && !hasDraftEmail) {
          hasInboxEmail = true;
        }
      }

      let threadFolderType: "inbox" | "sent" | "draft" | "trash" = "inbox";
      if (hasDraftEmail) {
        threadFolderType = "draft";
      } else if (hasTrashEmail) {
        threadFolderType = "trash";
      } else if (hasInboxEmail) {
        threadFolderType = "inbox";
      } else if (hasSentEmail) {
        threadFolderType = "sent";
      }

      const latestDate = threadEmails.reduce<Date | null>((acc, e) => {
        const d = e.sentAt ?? e.receivedAt ?? e.createdTime;
        if (!d) return acc;
        const t = d.getTime ? d.getTime() : new Date(d).getTime();
        return !acc || t > acc.getTime() ? new Date(t) : acc;
      }, null);
      const updateData = {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
        ...(latestDate && { lastMessageDate: latestDate }),
      };

      await db.thread.update({
        where: { id: thread.id },
        data: updateData,
      });


      if (threadFolderType === "inbox") inboxCount++;
      else if (threadFolderType === "sent") sentCount++;
      else if (threadFolderType === "draft") draftCount++;


    }

    const dbInboxCount = await db.thread.count({
      where: { accountId, inboxStatus: true },
    });
    const dbSentCount = await db.thread.count({
      where: { accountId, sentStatus: true },
    });
    const dbDraftCount = await db.thread.count({
      where: { accountId, draftStatus: true },
    });

    if (dbInboxCount === 0 && threads.length > 0) {
      console.error(
        `[recalculateAllThreadStatuses] WARNING: NO INBOX THREADS FOUND for account ${accountId}`,
      );
    }

    await db.account.update({
      where: { id: accountId },
      data: { lastInboxSyncAt: new Date() },
    }).catch(err => console.error(`[recalculateAllThreadStatuses] Failed to update lastInboxSyncAt:`, err));

    console.log(
      `[sync] Account ${accountId}: threads recalculated (inbox=${dbInboxCount}, sent=${dbSentCount}, draft=${dbDraftCount})`,
    );

  } catch (error) {
    console.error("[recalculateAllThreadStatuses] Error:", error);
  }
}

async function upsertEmail(email: EmailMessage, accountId: string) {
  if (!email.id || !email.threadId) {
    console.error(
      `[upsertEmail] Invalid email data - missing id or threadId:`,
      {
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
      },
    );
    return;
  }

  try {
    const sysLabelsRaw = Array.isArray(email.sysLabels) ? email.sysLabels : [];
    const sysLabels = sysLabelsRaw.map((l) => String(l).toLowerCase()) as EmailMessage["sysLabels"];
    email.sysLabels = sysLabels;
    const labelsLower = sysLabels;
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";
    const isTrash = labelsLower.includes("trash");

    if (labelsLower.includes("draft")) {
      emailLabelType = "draft";
    } else if (labelsLower.includes("sent") && !isTrash) {
      emailLabelType = "sent";
    } else if (isTrash) {
      emailLabelType = "inbox";
    } else {
      emailLabelType = "inbox";
      if (!labelsLower.includes("inbox")) {
        email.sysLabels = [...sysLabels, "inbox"] as EmailMessage["sysLabels"];
      }
    }

    const embeddingVector = null;

    const addressToUpsert = new Map<string, EmailAddress>();
    const allAddresses = [
      email.from,
      ...(email.to ?? []),
      ...(email.cc ?? []),
      ...(email.bcc ?? []),
      ...(email.replyTo ?? []),
    ].filter((a): a is EmailAddress => a != null);
    for (const address of allAddresses) {
      const rawAddr = address?.address ?? "";
      const key = normalizeEmailAddressString(rawAddr, address?.raw) ?? rawAddr.trim().toLowerCase();
      if (key && key.includes("@")) addressToUpsert.set(key, address);
    }

    const upsertedAddresses: (Awaited<
      ReturnType<typeof upsertEmailAddress>
    > | null)[] = [];

    for (const address of addressToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddr = email.from?.address ?? "";
    const fromNormalized = normalizeEmailAddressString(fromAddr, email.from?.raw);
    const fromAddress = fromNormalized ? addressMap.get(fromNormalized) : null;
    if (!fromAddress) {
      return;
    }

    const safeAddrKey = (addr: EmailAddress) =>
      normalizeEmailAddressString(addr?.address ?? "", addr?.raw) ?? (addr?.address ?? "").trim().toLowerCase();
    const toAddresses = (email.to ?? [])
      .map((addr) => addressMap.get(safeAddrKey(addr)))
      .filter(Boolean);
    const ccAddresses = (email.cc ?? [])
      .map((addr) => addressMap.get(safeAddrKey(addr)))
      .filter(Boolean);
    const bccAddresses = (email.bcc ?? [])
      .map((addr) => addressMap.get(safeAddrKey(addr)))
      .filter(Boolean);
    const replyToAddresses = (email.replyTo ?? [])
      .map((addr) => addressMap.get(safeAddrKey(addr)))
      .filter(Boolean);

    const lastMessageDate = safeDate(email.sentAt ?? email.receivedAt ?? email.createdTime);
    const existingThread = await db.thread.findUnique({
      where: { id: email.threadId },
      select: { lastMessageDate: true },
    });
    const effectiveLastMessageDate =
      !existingThread?.lastMessageDate || lastMessageDate > existingThread.lastMessageDate
        ? lastMessageDate
        : existingThread.lastMessageDate;
    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: effectiveLastMessageDate,
        done: false,
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,

        draftStatus: emailLabelType === "draft",
        inboxStatus: !isTrash && emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: effectiveLastMessageDate,
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });

    const upsertedEmail = await db.email.upsert({
      where: { internetMessageId: email.internetMessageId },
      update: {
        threadId: thread.id,
        createdTime: safeDate(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: safeDate(email.sentAt),
        receivedAt: safeDate(email.receivedAt),
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders:
          email.internetHeaders as unknown as Prisma.InputJsonValue[],
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties:
          email.nativeProperties as unknown as Prisma.InputJsonValue,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
        summary: null,
      },
      create: {
        id: email.id,
        internetMessageId: email.internetMessageId,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: safeDate(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: safeDate(email.sentAt),
        receivedAt: safeDate(email.receivedAt),
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders:
          email.internetHeaders as unknown as Prisma.InputJsonValue[],
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties:
          email.nativeProperties as unknown as Prisma.InputJsonValue,
        folderId: email.folderId,
        omitted: email.omitted,
        summary: null,
      },
    });

    if (embeddingVector) {
      await db.$executeRaw`
            UPDATE "Email" 
            SET embedding = ${embeddingVector}::vector
            WHERE id = ${upsertedEmail.id}
        `;
    }

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let hasInboxEmail = false;
    let hasDraftEmail = false;
    let hasSentEmail = false;
    let hasTrashEmail = false;

    for (const threadEmail of threadEmails) {
      if (
        threadEmail.emailLabel === "draft" ||
        threadEmail.sysLabels?.includes("draft")
      ) {
        hasDraftEmail = true;
        break;
      }
      if (threadEmail.sysLabels?.includes("trash")) {
        hasTrashEmail = true;
      }
      if (
        threadEmail.emailLabel === "inbox" ||
        threadEmail.sysLabels?.includes("inbox") ||
        threadEmail.sysLabels?.includes("spam") ||
        threadEmail.sysLabels?.includes("junk") ||
        threadEmail.sysClassifications?.includes("promotions") ||
        threadEmail.sysClassifications?.includes("social") ||
        threadEmail.sysClassifications?.includes("updates") ||
        threadEmail.sysClassifications?.includes("forums")
      ) {
        hasInboxEmail = true;
      }
      if (!hasInboxEmail && threadEmail.emailLabel !== "sent") {
        hasInboxEmail = true;
      }
      if (
        threadEmail.emailLabel === "sent" &&
        !threadEmail.sysLabels?.includes("inbox") &&
        !threadEmail.sysLabels?.includes("spam") &&
        !threadEmail.sysLabels?.includes("junk") &&
        !threadEmail.sysClassifications?.includes("promotions") &&
        !threadEmail.sysClassifications?.includes("social") &&
        !threadEmail.sysClassifications?.includes("updates") &&
        !threadEmail.sysClassifications?.includes("forums")
      ) {
        hasSentEmail = true;
      }
    }

    let threadFolderType: "inbox" | "sent" | "draft" | "trash" = "inbox";
    if (hasDraftEmail) {
      threadFolderType = "draft";
    } else if (hasTrashEmail) {
      threadFolderType = "trash";
    } else if (hasInboxEmail) {
      threadFolderType = "inbox";
    } else if (hasSentEmail) {
      threadFolderType = "sent";
    }

    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    const metadataOnlyAttachments = email.attachments.map((att) => ({
      ...att,
      content: undefined,
    }));
    for (const attachment of metadataOnlyAttachments) {
      await upsertAttachment(upsertedEmail.id, attachment);
    }
  } catch (err) {
    throw err;
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert attachment: ${error}`);
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  const addr = normalizeEmailAddressString(address?.address ?? "", address?.raw);
  if (!addr || !addr.includes("@")) return null;
  try {
    return await db.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId,
          address: addr,
        },
      },
      create: {
        address: addr,
        name: address.name ?? undefined,
        raw: address.raw ?? undefined,
        accountId,
      },
      update: {
        name: address.name ?? undefined,
        raw: address.raw ?? undefined,
      },
    });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code: string }).code : "";
    if (code === "P2002") {
      const existing = await db.emailAddress.findUnique({
        where: { accountId_address: { accountId, address: addr } },
      });
      return existing ?? null;
    }
    if (code === "P2003") {
      return null;
    }
    return null;
  }
}
