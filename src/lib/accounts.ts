import type {
  EmailAddress,
  EmailMessage,
  syncResponse,
  syncUpdateResponse,
} from "@/types";
import axios from "axios";
import { syncEmailsToDatabase } from "./sync-to-db";
import { db } from "@/server/db";

const syncLocks = new Map<string, Promise<void>>();

export class Account {
  private id: string;
  private token: string;

  constructor(id: string, token: string) {
    this.id = id;
    this.token = token;
  }

  private get aurinkoHeaders() {
    if (!this.token || !this.id) {
      throw new Error("Missing Aurinko token or account id");
    }

    return {
      Authorization: `Bearer ${this.token}`,
      "X-Aurinko-Account-Id": String(this.id),
    };
  }

  async performInitialSync() {
    try {
      console.log("[Initial Sync] Starting sync initialization...");

      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        console.log("[Initial Sync] Waiting for sync to be ready...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      console.log("[Initial Sync] Sync ready, starting to fetch emails...");
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;

      let updatedResponse = await this.getUpdatedEmails(storedDeltaToken);
      let allEmails: EmailMessage[] = updatedResponse.records || [];
      let pageCount = 1;

      console.log(
        `[Initial Sync] Page ${pageCount}: ${allEmails.length} emails (total: ${allEmails.length})`,
      );

      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }

      while (updatedResponse.nextPageToken) {
        pageCount++;
        console.log(
          `[Initial Sync] Fetching page ${pageCount} with token: ${updatedResponse.nextPageToken.substring(0, 20)}...`,
        );

        updatedResponse = await this.getUpdatedEmails(
          undefined,
          updatedResponse.nextPageToken,
        );

        const pageEmails = updatedResponse.records || [];
        allEmails = allEmails.concat(pageEmails);

        console.log(
          `[Initial Sync] Page ${pageCount}: ${pageEmails.length} emails (total: ${allEmails.length})`,
        );

        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }

        if (pageCount > 1000) {
          console.warn(
            `[Initial Sync] Safety limit reached (1000 pages), stopping pagination`,
          );
          break;
        }
      }

      const inboxCount = allEmails.filter(
        (e) =>
          e.sysLabels.includes("inbox") || e.sysLabels.includes("important"),
      ).length;
      const sentCount = allEmails.filter(
        (e) => e.sysLabels.includes("sent") && !e.sysLabels.includes("draft"),
      ).length;
      const draftCount = allEmails.filter((e) =>
        e.sysLabels.includes("draft"),
      ).length;

      console.log(
        `[Initial Sync] Complete! Fetched ${allEmails.length} emails across ${pageCount} pages (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount})`,
      );

      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[Initial Sync] API error:",
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error("[Initial Sync] Error:", error);
      }
      throw error;
    }
  }

  private async startSync() {
    console.log("[AURINKO AUTH] Using accountToken for account:", this.id);

    const response = await axios.post<syncResponse>(
      `https://api.aurinko.io/v1/email/sync`,
      {},
      {
        headers: this.aurinkoHeaders,
        params: {
          daysWithin: 30,
          bodyType: "text",
        },
      },
    );
    return response.data;
  }

  private async getUpdatedEmails(
    deltaToken?: string,
    pageToken?: string,
    metadataOnly: boolean = false,
  ) {
    const params: Record<string, string> = {};

    if (pageToken) {
      params.pageToken = pageToken;
    } else if (deltaToken) {
      params.deltaToken = deltaToken;
    }

    if (metadataOnly) {
      params.bodyType = "text";
    }

    const response = await axios.get<syncUpdateResponse>(
      `https://api.aurinko.io/v1/email/sync/updated`,
      {
        headers: this.aurinkoHeaders,
        params,
      },
    );
    return response.data;
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    threadId?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
  }) {
    try {
      const payload: Record<string, unknown> = {
        from,
        subject,
        body,
        to,
      };

      if (inReplyTo) payload.inReplyTo = inReplyTo;
      if (references) payload.references = references;
      if (threadId) payload.threadId = threadId;
      if (cc && cc.length > 0) payload.cc = cc;
      if (bcc && bcc.length > 0) payload.bcc = bcc;
      if (replyTo) payload.replyTo = [replyTo];

      const response = await axios.post(
        `https://api.aurinko.io/v1/email/messages`,
        payload,
        {
          params: {
            returnIds: true,
          },
          headers: this.aurinkoHeaders,
        },
      );

      console.log("sendmail", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending email:",
          JSON.stringify(error.response?.data, null, 2),
        );

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        const errorDetails = error.response?.data;
        const enhancedError = new Error(
          `Email send failed: ${errorMessage}${errorDetails ? ` (${JSON.stringify(errorDetails)})` : ""}`,
        );
        (
          enhancedError as unknown as { status?: number; response?: unknown }
        ).status = error.response?.status;
        (
          enhancedError as unknown as { status?: number; response?: unknown }
        ).response = error.response?.data;
        throw enhancedError;
      } else {
        console.error("Error sending email:", error);
        throw error;
      }
    }
  }

  async getEmailById(emailId: string): Promise<EmailMessage | null> {
    try {
      const response = await axios.get<EmailMessage>(
        `https://api.aurinko.io/v1/email/messages/${emailId}`,
        {
          headers: this.aurinkoHeaders,
          params: {
            bodyType: "html",
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `Error fetching email ${emailId}:`,
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error(`Error fetching email ${emailId}:`, error);
      }
      return null;
    }
  }

  async syncEmails(forceFullSync = false) {
    const existingSync = syncLocks.get(this.id);
    if (existingSync) {
      console.log(
        `[syncEmails] Sync already in progress for account ${this.id}, waiting for it to complete...`,
      );
      await existingSync;
      console.log(
        `[syncEmails] Existing sync completed, skipping duplicate sync request`,
      );
      return;
    }

    const syncPromise = this._performSync(forceFullSync);
    syncLocks.set(this.id, syncPromise);

    try {
      await syncPromise;
    } finally {
      syncLocks.delete(this.id);
    }
  }

  private async _performSync(forceFullSync = false) {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) throw new Error("Invalid token");

    console.log(
      `[syncEmails] Starting email sync for account ${account.id} (forceFullSync: ${forceFullSync})`,
    );

    if (forceFullSync && account.nextDeltaToken) {
      console.log(
        `[syncEmails] Force sync: First fetching latest emails via delta sync...`,
      );
      try {
        const latestResponse = await this.getUpdatedEmails(
          account.nextDeltaToken,
          undefined,
          true,
        );
        const latestEmails = latestResponse.records || [];
        if (latestEmails.length > 0) {
          console.log(
            `[syncEmails] Found ${latestEmails.length} latest emails, syncing first...`,
          );
          await syncEmailsToDatabase(latestEmails, account.id);

          if (latestResponse.nextDeltaToken) {
            await db.account.update({
              where: { id: account.id },
              data: { nextDeltaToken: latestResponse.nextDeltaToken },
            });
          }
          console.log(
            `[syncEmails] Latest emails synced, now doing full sync...`,
          );
        } else {
          console.log(
            `[syncEmails] No latest emails found, proceeding with full sync...`,
          );
        }
      } catch (error) {
        console.warn(
          "[syncEmails] Latest email sync failed, continuing with full sync:",
          error,
        );
      }
    }

    const shouldMaintain30DayWindow =
      forceFullSync || (await this.shouldRefresh30DayWindow(account.id));

    if (shouldMaintain30DayWindow) {
      console.log(
        `[syncEmails] Maintaining 30-day window - fetching ALL emails from last 30 days directly from messages API`,
      );
      try {
        const allEmails = await this.fetchAllEmailsDirectly();
        console.log(
          `[syncEmails] Fetched ${allEmails.length} emails from last 30 days, syncing to database...`,
        );

        await syncEmailsToDatabase(allEmails, account.id);
        console.log(
          `[syncEmails] Successfully synced ${allEmails.length} emails to database`,
        );

        let storedDeltaToken: string = "";
        try {
          const syncResponse = await this.startSync();
          if (syncResponse.ready && syncResponse.syncUpdatedToken) {
            storedDeltaToken = syncResponse.syncUpdatedToken;
          }
        } catch (syncError) {
          console.warn(
            "[syncEmails] Could not get new delta token, continuing without it:",
            syncError,
          );
        }

        await db.account.update({
          where: { id: account.id },
          data: {
            nextDeltaToken: storedDeltaToken,
            lastInboxSyncAt: new Date(),
          },
        });

        console.log(
          `[syncEmails] 30-day window sync completed for account ${account.id}`,
        );
        return;
      } catch (directFetchError) {
        console.error(
          "[syncEmails] Direct fetch failed, falling back to sync API:",
          directFetchError,
        );
      }
    }

    const updatedAccount = await db.account.findUnique({
      where: { token: this.token },
    });
    if (!updatedAccount) throw new Error("Invalid token");

    let allEmails: EmailMessage[] = [];
    let storedDeltaToken: string;

    if (!updatedAccount.nextDeltaToken) {
      console.log(
        "[syncEmails] Performing full initial sync (first connection)...",
      );
      console.log("[syncEmails] Calling performInitialSync()...");
      const initialSyncResult = await this.performInitialSync();
      allEmails = initialSyncResult?.emails ?? [];
      storedDeltaToken = initialSyncResult?.deltaToken ?? "";
      console.log(
        `[syncEmails] performInitialSync() completed: ${allEmails.length} emails, deltaToken: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
      );
      await db.account.update({
        where: { id: account.id },
        data: { lastInboxSyncAt: new Date() },
      });
    } else {
      const deltaToken = updatedAccount.nextDeltaToken;
      if (!deltaToken) {
        console.log(
          "[syncEmails] No delta token found, performing initial sync...",
        );
        const initialSyncResult = await this.performInitialSync();
        allEmails = initialSyncResult?.emails ?? [];
        storedDeltaToken = initialSyncResult?.deltaToken ?? "";
        console.log(
          `[syncEmails] performInitialSync() completed: ${allEmails.length} emails, deltaToken: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
        );
        await db.account.update({
          where: { id: account.id },
          data: { lastInboxSyncAt: new Date() },
        });
      } else {
        console.log(`Using delta token: ${deltaToken.substring(0, 20)}...`);
        let response = await this.getUpdatedEmails(deltaToken);
        allEmails = response.records || [];
        storedDeltaToken = deltaToken;

        console.log(`Delta sync response: ${allEmails.length} emails found`);

        if (response.nextDeltaToken) {
          storedDeltaToken = response.nextDeltaToken;
          console.log(`Updated delta token: ${storedDeltaToken}`);
        }

        while (response.nextPageToken) {
          console.log(
            `Fetching next page with token: ${response.nextPageToken}`,
          );
          response = await this.getUpdatedEmails("", response.nextPageToken);
          allEmails = allEmails.concat(response.records);
          console.log(
            `Page response: ${response.records.length} emails, total: ${allEmails.length}`,
          );
          if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken;
          }
        }
      }
    }

    console.log(`[syncEmails] Total emails to sync: ${allEmails.length}`);

    try {
      console.log(
        `[syncEmails] Starting DB insert for ${allEmails.length} emails...`,
      );
      await syncEmailsToDatabase(allEmails, account.id);
      console.log(
        `[syncEmails] Successfully synced ${allEmails.length} emails to database`,
      );
    } catch (error) {
      console.error("[syncEmails] Error syncing emails to database:", error);
    }

    console.log(
      `[syncEmails] Updating delta token for account ${account.id}...`,
    );
    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
    console.log(
      `[syncEmails] Delta token updated successfully: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
    );

    console.log(`[syncEmails] Email sync completed for account ${account.id}`);
  }

  private async shouldRefresh30DayWindow(accountId: string): Promise<boolean> {
    try {
      const account = await db.account.findUnique({
        where: { id: accountId },
        select: {
          lastInboxSyncAt: true,
          nextDeltaToken: true,
        },
      });

      if (!account?.nextDeltaToken) {
        console.log(
          "[shouldRefresh30DayWindow] No delta token found, will do initial sync instead",
        );
        return false;
      }

      if (account.lastInboxSyncAt) {
        const sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        if (account.lastInboxSyncAt > sixHoursAgo) {
          console.log(
            "[shouldRefresh30DayWindow] Last sync was recent, using delta sync",
          );
          return false;
        }
      }

      console.log(
        "[shouldRefresh30DayWindow] Last sync was more than 6 hours ago, refreshing 30-day window",
      );
      return true;
    } catch (error) {
      console.error("[shouldRefresh30DayWindow] Error checking window:", error);
      return false;
    }
  }

  async syncLatestEmails(): Promise<{ success: boolean; count: number }> {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) {
      throw new Error("Invalid token");
    }

    const shouldRefresh = await this.shouldRefresh30DayWindow(account.id);
    if (shouldRefresh) {
      console.log(
        `[Latest Sync] 30-day window needs refresh, doing full sync instead`,
      );
      try {
        await this.syncEmails(true);
        return { success: true, count: 0 };
      } catch (error) {
        console.error(`[Latest Sync] Full sync failed:`, error);
        return { success: false, count: 0 };
      }
    }

    if (!account.nextDeltaToken) {
      console.log(
        `Skipping latest sync - account ${account.id} needs initial sync first`,
      );
      return { success: false, count: 0 };
    }

    try {
      console.log(
        `[Latest Sync] Starting lightweight sync for account ${account.id}`,
      );
      const startTime = Date.now();

      const response = await this.getUpdatedEmails(
        account.nextDeltaToken,
        undefined,
        true,
      );

      const newEmails = response.records || [];
      let storedDeltaToken = account.nextDeltaToken;

      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }

      if (newEmails.length > 0) {
        const inboxCount = newEmails.filter(
          (e) =>
            e.sysLabels.includes("inbox") || e.sysLabels.includes("important"),
        ).length;
        const sentCount = newEmails.filter(
          (e) => e.sysLabels.includes("sent") && !e.sysLabels.includes("draft"),
        ).length;
        const draftCount = newEmails.filter((e) =>
          e.sysLabels.includes("draft"),
        ).length;

        console.log(
          `[Latest Sync] Found ${newEmails.length} new emails (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount}), syncing...`,
        );

        await syncEmailsToDatabase(newEmails, account.id);

        await db.account.update({
          where: { id: account.id },
          data: { nextDeltaToken: storedDeltaToken },
        });

        const duration = Date.now() - startTime;
        console.log(
          `[Latest Sync] Completed in ${duration}ms - synced ${newEmails.length} emails`,
        );

        return { success: true, count: newEmails.length };
      } else {
        if (response.nextDeltaToken) {
          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: storedDeltaToken },
          });
        }

        const duration = Date.now() - startTime;
        console.log(`[Latest Sync] No new emails (${duration}ms)`);
        return { success: true, count: 0 };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        if (status === 400 || status === 410) {
          console.warn(
            `[Latest Sync] Delta token invalid/expired for account ${account.id}, resetting...`,
          );

          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: null },
          });

          console.log(
            `[Latest Sync] Delta token reset - will use full sync on next regular sync`,
          );
          return { success: false, count: 0 };
        }

        console.error(
          `[Latest Sync] API error for account ${account.id}:`,
          errorData,
        );
      } else {
        console.error(
          `[Latest Sync] Error syncing latest emails for account ${account.id}:`,
          error,
        );
      }

      return { success: false, count: 0 };
    }
  }

  async fetchInboxEmails(
    pageToken?: string,
    maxResults: number = 50,
  ): Promise<{
    emails: Array<{
      id: string;
      from: { name: string | null; address: string };
      subject: string;
      date: string;
      snippet: string;
    }>;
    nextPageToken?: string;
  }> {
    try {
      const params: Record<string, string | number> = {
        q: "in:all",
        maxResults: Math.min(maxResults, 100),
        bodyType: "text",
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const listResponse = await axios.get<{
        messages?: Array<{ id: string }>;
        nextPageToken?: string;
      }>("https://api.aurinko.io/v1/email/messages", {
        headers: this.aurinkoHeaders,
        params,
      });

      const messageIds = listResponse.data.messages?.map((m) => m.id) ?? [];

      if (messageIds.length === 0) {
        return {
          emails: [],
          nextPageToken: listResponse.data.nextPageToken,
        };
      }

      const emails = await Promise.all(
        messageIds.map((id) => this.getEmailById(id)),
      );

      const mappedEmails = emails
        .filter((e): e is EmailMessage => e !== null)
        .map((e) => ({
          id: e.id,
          from: {
            name: e.from.name || null,
            address: e.from.address,
          },
          subject: e.subject || "(No subject)",
          date: e.sentAt,
          snippet: e.bodySnippet || e.body?.substring(0, 200) || "",
        }));

      return {
        emails: mappedEmails,
        nextPageToken: listResponse.data.nextPageToken,
      };
    } catch (error) {
      console.error("[fetchInboxEmails] Failed:", error);
      throw error;
    }
  }

  async fetchAllEmailsDirectly(): Promise<EmailMessage[]> {
    try {
      console.log(
        "[fetchAllEmailsDirectly] Starting to fetch all emails from last 30 days...",
      );
      const allEmails: EmailMessage[] = [];
      let pageToken: string | undefined = undefined;
      let pageCount = 0;
      const maxPages = 500;
      let consecutiveEmptyPages = 0;
      const maxConsecutiveEmpty = 3;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const year = thirtyDaysAgo.getFullYear();
      const month = String(thirtyDaysAgo.getMonth() + 1).padStart(2, "0");
      const day = String(thirtyDaysAgo.getDate()).padStart(2, "0");
      const dateQuery = `after:${year}/${month}/${day}`;
      const dateQueryAlt = `after:${year}-${month}-${day}`;

      console.log(
        `[fetchAllEmailsDirectly] Date query: ${dateQuery} (after ${year}-${month}-${day})`,
      );
      console.log(
        `[fetchAllEmailsDirectly] 30 days ago timestamp: ${thirtyDaysAgo.toISOString()}`,
      );

      while (pageCount < maxPages) {
        pageCount++;
        console.log(`[fetchAllEmailsDirectly] Fetching page ${pageCount}...`);

        const params: Record<string, string | number> = {
          q: `in:all ${dateQuery}`,
          maxResults: 500,
          bodyType: "text",
        };

        if (pageToken) {
          params.pageToken = pageToken;
        }

        try {
          const listResponse = await axios.get<{
            messages?: Array<{ id: string }>;
            nextPageToken?: string;
          }>("https://api.aurinko.io/v1/email/messages", {
            headers: this.aurinkoHeaders,
            params,
          });

          const messageIds = listResponse.data.messages?.map((m) => m.id) ?? [];
          console.log(
            `[fetchAllEmailsDirectly] Page ${pageCount}: Found ${messageIds.length} message IDs, nextPageToken: ${listResponse.data.nextPageToken ? "yes" : "no"}`,
          );

          if (pageCount === 1 && messageIds.length < 50 && !pageToken) {
            console.log(
              `[fetchAllEmailsDirectly] First page returned few results (${messageIds.length}), trying without in:all restriction...`,
            );

            params.q = dateQuery;
            const retryResponse = await axios.get<{
              messages?: Array<{ id: string }>;
              nextPageToken?: string;
            }>("https://api.aurinko.io/v1/email/messages", {
              headers: this.aurinkoHeaders,
              params,
            });
            const retryMessageIds =
              retryResponse.data.messages?.map((m) => m.id) ?? [];
            console.log(
              `[fetchAllEmailsDirectly] Retry without in:all: Found ${retryMessageIds.length} message IDs`,
            );
            if (retryMessageIds.length > messageIds.length) {
              pageToken = retryResponse.data.nextPageToken;

              const batchSize = 50;
              for (let i = 0; i < retryMessageIds.length; i += batchSize) {
                const batch = retryMessageIds.slice(i, i + batchSize);
                const batchEmails = await Promise.all(
                  batch.map((id) => this.getEmailById(id)),
                );
                const validEmails = batchEmails.filter(
                  (e): e is EmailMessage => e !== null,
                );
                allEmails.push(...validEmails);
              }
              continue;
            }

            params.q = `in:all ${dateQuery}`;
          }

          if (messageIds.length === 0) {
            consecutiveEmptyPages++;
            console.log(
              `[fetchAllEmailsDirectly] Empty page ${pageCount} (consecutive: ${consecutiveEmptyPages})`,
            );

            if (listResponse.data.nextPageToken) {
              pageToken = listResponse.data.nextPageToken;
              continue;
            }

            if (consecutiveEmptyPages >= maxConsecutiveEmpty) {
              console.log(
                `[fetchAllEmailsDirectly] Stopping after ${consecutiveEmptyPages} consecutive empty pages`,
              );
              break;
            }

            if (allEmails.length > 0 && !listResponse.data.nextPageToken) {
              console.log(
                `[fetchAllEmailsDirectly] No more pages available, stopping`,
              );
              break;
            }

            pageToken = listResponse.data.nextPageToken;
            continue;
          }

          consecutiveEmptyPages = 0;

          const batchSize = 50;
          for (let i = 0; i < messageIds.length; i += batchSize) {
            const batch = messageIds.slice(i, i + batchSize);
            const batchEmails = await Promise.all(
              batch.map((id) => this.getEmailById(id)),
            );

            const validEmails = batchEmails.filter(
              (e): e is EmailMessage => e !== null,
            );
            allEmails.push(...validEmails);

            console.log(
              `[fetchAllEmailsDirectly] Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messageIds.length / batchSize)}, batch size: ${validEmails.length}, total emails: ${allEmails.length}`,
            );
          }

          pageToken = listResponse.data.nextPageToken;

          if (!pageToken) {
            console.log(
              `[fetchAllEmailsDirectly] No nextPageToken, finished fetching`,
            );
            break;
          }
        } catch (pageError) {
          console.error(
            `[fetchAllEmailsDirectly] Error on page ${pageCount}:`,
            pageError,
          );

          if (axios.isAxiosError(pageError)) {
            const status = pageError.response?.status;
            if (status === 429 || (status && status >= 500 && status < 600)) {
              console.log(
                `[fetchAllEmailsDirectly] Rate limit or server error, waiting 2 seconds before retry...`,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              continue;
            }
          }

          console.warn(
            `[fetchAllEmailsDirectly] Breaking due to error on page ${pageCount}`,
          );
          break;
        }
      }

      if (pageCount >= maxPages) {
        console.warn(
          `[fetchAllEmailsDirectly] Reached max pages limit (${maxPages}), stopping. Total fetched: ${allEmails.length}`,
        );
      }

      console.log(
        `[fetchAllEmailsDirectly] Complete! Fetched ${allEmails.length} emails across ${pageCount} pages`,
      );

      return allEmails;
    } catch (error) {
      console.error("[fetchAllEmailsDirectly] Failed:", error);
      throw error;
    }
  }
}
