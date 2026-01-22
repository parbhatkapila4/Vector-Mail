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


const aurinkoAxios = axios.create({
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out - please try again',
});

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

  private async validateToken(): Promise<boolean> {
    try {
      console.log(`[validateToken] Validating token for account ${this.id}...`);

      const response = await aurinkoAxios.get(
        `https://api.aurinko.io/v1/email/messages`,
        {
          headers: this.aurinkoHeaders,
          params: {
            maxResults: 1,
            bodyType: "text",
          },
          timeout: 10000,
        },
      );
      console.log(
        `[validateToken] Token is valid (status: ${response.status})`,
      );


      await db.account.update({
        where: { id: this.id },
        data: { needsReconnection: false },
      }).catch(err => console.error(`[validateToken] Failed to update needsReconnection:`, err));

      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error(
            `[validateToken] Token validation failed (401) for account ${this.id} - token is expired or invalid`,
          );
          console.error(`[validateToken] Error response:`, error.response?.data);


          await db.account.update({
            where: { id: this.id },
            data: { needsReconnection: true },
          }).catch(err => console.error(`[validateToken] Failed to update needsReconnection:`, err));

          return false;
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.warn(
            `[validateToken] Token validation timed out for account ${this.id} - treating as temporary network issue`,
          );

          return true;
        }
      }

      console.warn(
        `[validateToken] Token validation check failed with non-401 error (network/timeout):`,
        error,
      );


      return true;
    }
  }

  async performInitialSync(folder?: "inbox" | "sent") {
    try {
      if (folder) {
        console.log(
          `[Initial Sync] Starting initial sync for ${folder.toUpperCase()} folder only...`,
        );
        const folderEmails = await this.fetchEmailsByFolder(folder);
        await syncEmailsToDatabase(folderEmails, this.id);

        const count = folderEmails.length;
        console.log(
          `[Initial Sync] Complete! Fetched ${count} ${folder} emails`,
        );

        return {
          emails: folderEmails,
          deltaToken: "",
        };
      }

      console.log(
        "[Initial Sync] Starting initial sync - using direct fetch for ALL emails from last 30 days...",
      );

      const allEmails = await this.fetchAllEmailsDirectly();

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
        `[Initial Sync] Complete! Fetched ${allEmails.length} emails (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount})`,
      );

      let storedDeltaToken: string = "";
      try {
        const syncResponse = await this.startSync();
        if (syncResponse.ready && syncResponse.syncUpdatedToken) {
          storedDeltaToken = syncResponse.syncUpdatedToken;
          console.log(
            `[Initial Sync] Delta token obtained: ${storedDeltaToken.substring(0, 20)}...`,
          );
        }
      } catch (syncError) {
        console.warn(
          "[Initial Sync] Could not get delta token, continuing without it:",
          syncError,
        );
      }

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

    try {
      const response = await aurinkoAxios.post<syncResponse>(
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error(
          "[startSync] Authentication failed (401) - token may be expired",
        );


        await db.account.update({
          where: { id: this.id },
          data: { needsReconnection: true },
        }).catch(err => console.error(`[startSync] Failed to update needsReconnection:`, err));

        throw new Error(
          "Authentication failed. Please reconnect your account.",
        );
      }
      throw error;
    }
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

    console.log(`[getUpdatedEmails] Calling sync/updated with:`, {
      accountId: this.id,
      hasDeltaToken: !!deltaToken,
      hasPageToken: !!pageToken,
      deltaTokenPreview: deltaToken
        ? deltaToken.substring(0, 20) + "..."
        : null,
      tokenPreview: this.token
        ? `${this.token.substring(0, 20)}...`
        : "MISSING",
    });

    try {
      const response = await aurinkoAxios.get<syncUpdateResponse>(
        `https://api.aurinko.io/v1/email/sync/updated`,
        {
          headers: this.aurinkoHeaders,
          params,
        },
      );

      console.log(`[getUpdatedEmails] Response:`, {
        status: response.status,
        recordCount: response.data.records?.length ?? 0,
        hasNextPage: !!response.data.nextPageToken,
        hasNextDelta: !!response.data.nextDeltaToken,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error(`[getUpdatedEmails] API error:`, {
          status,
          statusText: error.response?.statusText,
          data: errorData,
          headers: error.response?.headers,
        });

        if (status === 401) {
          console.error(
            `[getUpdatedEmails] Authentication failed (401) for account ${this.id} - token may be expired or invalid`,
          );


          await db.account.update({
            where: { id: this.id },
            data: { needsReconnection: true },
          }).catch(err => console.error(`[getUpdatedEmails] Failed to update needsReconnection:`, err));

          throw new Error(
            "Authentication failed. Please reconnect your account.",
          );
        }
      }
      throw error;
    }
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

      const response = await aurinkoAxios.post(
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
      const response = await aurinkoAxios.get<EmailMessage>(
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

  async syncEmails(forceFullSync = false, folder?: "inbox" | "sent") {
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

    const syncPromise = this._performSync(forceFullSync, folder);
    syncLocks.set(this.id, syncPromise);

    try {
      await syncPromise;
    } finally {
      syncLocks.delete(this.id);
    }
  }

  private async _performSync(forceFullSync = false, folder?: "inbox" | "sent") {
    const account = await db.account.findUnique({
      where: {
        id: this.id,
      },
    });
    if (!account) {
      console.error(`[_performSync] Account ${this.id} not found in database`);
      throw new Error("Account not found");
    }

    if (!account.token) {
      console.error(`[_performSync] Account ${this.id} has no token stored`);
      throw new Error(
        "Account token is missing. Please reconnect your account.",
      );
    }
    this.token = account.token;

    console.log(
      `[syncEmails] Starting email sync for account ${account.id} (forceFullSync: ${forceFullSync}, folder: ${folder || "all"})`,
    );


    if (folder) {
      console.log(`[syncEmails] Folder-specific sync requested: ${folder}`);
      try {
        const folderEmails = await this.fetchEmailsByFolder(folder);
        console.log(`[syncEmails] ✓ Fetched ${folderEmails.length} ${folder} emails`);

        if (folderEmails.length > 0) {
          await syncEmailsToDatabase(folderEmails, account.id);
          console.log(`[syncEmails] ✓ Synced ${folderEmails.length} ${folder} emails to database`);
        } else {
          console.log(`[syncEmails] No ${folder} emails found to sync`);
        }

        return;
      } catch (folderError) {
        console.error(`[syncEmails] Folder-specific sync failed:`, folderError);
        throw folderError;
      }
    }

    const inboxThreadCount = await db.thread.count({
      where: {
        accountId: account.id,
        inboxStatus: true,
      },
    });

    const shouldMaintain30DayWindow =
      forceFullSync ||
      inboxThreadCount === 0 ||
      (await this.shouldRefresh30DayWindow(account.id));

    if (inboxThreadCount === 0 && !forceFullSync) {
      console.log(
        `[syncEmails] Inbox is empty (${inboxThreadCount} threads), forcing full sync regardless of forceFullSync flag`,
      );
    }

    if (shouldMaintain30DayWindow) {
      console.log(
        `[syncEmails] Maintaining 30-day window - using sync API (primary method)`,
      );

      try {
        console.log(`[syncEmails] Starting sync API...`);
        const syncResponse = await this.startSync();
        console.log(`[syncEmails] Sync API response:`, {
          ready: syncResponse.ready,
          hasToken: !!syncResponse.syncUpdatedToken,
          syncUpdatedToken: syncResponse.syncUpdatedToken
            ? syncResponse.syncUpdatedToken.substring(0, 30) + "..."
            : null,
        });

        if (!syncResponse.ready) {
          throw new Error("Sync API not ready - waiting might be required");
        }

        if (!syncResponse.syncUpdatedToken) {
          throw new Error("Sync API did not return syncUpdatedToken");
        }

        console.log(
          `[syncEmails] Sync API ready, fetching emails with token...`,
        );
        const syncEmails: EmailMessage[] = [];
        let syncPageToken: string | undefined = undefined;
        let currentDeltaToken = syncResponse.syncUpdatedToken;
        let syncPageCount = 0;
        const maxSyncPages = 200;
        let hasNextDeltaToken = false;
        let consecutiveEmptyPages = 0;
        const maxConsecutiveEmpty = 3;

        do {
          syncPageCount++;
          console.log(
            `[syncEmails] Fetching sync API page ${syncPageCount}...`,
          );

          const syncUpdateResponse = await this.getUpdatedEmails(
            syncPageToken ? undefined : currentDeltaToken,
            syncPageToken,
          );

          console.log(`[syncEmails] Sync API page ${syncPageCount} response:`, {
            recordCount: syncUpdateResponse.records?.length ?? 0,
            hasNextPage: !!syncUpdateResponse.nextPageToken,
            hasNextDelta: !!syncUpdateResponse.nextDeltaToken,
          });

          if (
            syncUpdateResponse.records &&
            syncUpdateResponse.records.length > 0
          ) {
            syncEmails.push(...syncUpdateResponse.records);
            consecutiveEmptyPages = 0;
            console.log(
              `[syncEmails] ✓ Sync API page ${syncPageCount}: ${syncUpdateResponse.records.length} emails, total: ${syncEmails.length}`,
            );
          } else {
            consecutiveEmptyPages++;
            console.warn(
              `[syncEmails] ⚠ Sync API page ${syncPageCount} returned 0 emails (consecutive: ${consecutiveEmptyPages})`,
            );
          }

          if (syncUpdateResponse.nextDeltaToken) {
            currentDeltaToken = syncUpdateResponse.nextDeltaToken;
            hasNextDeltaToken = true;
            console.log(
              `[syncEmails] Received nextDeltaToken - sync window complete`,
            );
          }

          syncPageToken = syncUpdateResponse.nextPageToken;

          if (hasNextDeltaToken && !syncPageToken) {
            console.log(
              `[syncEmails] Sync complete: has nextDeltaToken and no pageToken`,
            );
            break;
          }

          if (consecutiveEmptyPages >= maxConsecutiveEmpty) {
            console.warn(
              `[syncEmails] Stopping after ${consecutiveEmptyPages} consecutive empty pages`,
            );
            break;
          }

          const shouldContinue =
            syncPageToken || (!hasNextDeltaToken && syncPageCount < 50);

          if (!shouldContinue) {
            console.log(`[syncEmails] No more pages and sync appears complete`);
            break;
          }
        } while (syncPageCount < maxSyncPages);

        if (syncEmails.length === 0) {
          throw new Error(
            "Sync API returned 0 emails after fetching all pages",
          );
        }

        console.log(
          `[syncEmails] ✓ Fetched ${syncEmails.length} emails from sync API, syncing to database...`,
        );

        for (const email of syncEmails) {
          if (!email.sysLabels.includes("inbox")) {
            email.sysLabels.push("inbox");
          }
        }

        await syncEmailsToDatabase(syncEmails, account.id);

        await db.account.update({
          where: { id: account.id },
          data: {
            nextDeltaToken: syncResponse.syncUpdatedToken,
            lastInboxSyncAt: new Date(),
          },
        });

        console.log(
          `[syncEmails] ✓ 30-day window sync completed using sync API for account ${account.id}. Synced ${syncEmails.length} emails.`,
        );
        return;
      } catch (syncApiError) {
        console.error("[syncEmails] ✗ Sync API failed:", syncApiError);

        if (
          axios.isAxiosError(syncApiError) &&
          syncApiError.response?.status === 401
        ) {
          console.error(
            `[syncEmails] Authentication failed (401) - token may be expired or invalid`,
          );


          await db.account.update({
            where: { id: this.id },
            data: { needsReconnection: true },
          }).catch(err => console.error(`[syncEmails] Failed to update needsReconnection:`, err));

          throw new Error(
            "Authentication failed. Please reconnect your account to continue syncing emails.",
          );
        }

        const errorMessage =
          syncApiError instanceof Error
            ? syncApiError.message
            : String(syncApiError);
        throw new Error(
          `Sync API failed: ${errorMessage}. Please check your account connection and try again.`,
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

    if (allEmails.length === 0) {
      console.error(`[syncEmails] ⚠ CRITICAL: No emails to sync for account ${account.id} after all sync methods. This indicates:
      1. Account has no emails
      2. API authentication/authorization failed
      3. Query format is incorrect
      4. Account needs to be reconnected
      Please check account status and try reconnecting.`);
      throw new Error(
        "No emails found after attempting all sync methods. Please check your account connection.",
      );
    }

    try {
      console.log(
        `[syncEmails] Starting DB insert for ${allEmails.length} emails...`,
      );
      await syncEmailsToDatabase(allEmails, account.id);
      console.log(
        `[syncEmails] Successfully synced ${allEmails.length} emails to database`,
      );

      const savedEmailCount = await db.email.count({
        where: {
          thread: {
            accountId: account.id,
          },
        },
      });
      console.log(
        `[syncEmails] Verification: ${savedEmailCount} total emails in database for account ${account.id}`,
      );

      const threadCount = await db.thread.count({
        where: {
          accountId: account.id,
        },
      });
      console.log(
        `[syncEmails] Verification: ${threadCount} total threads in database for account ${account.id}`,
      );

      const inboxThreadCount = await db.thread.count({
        where: {
          accountId: account.id,
          inboxStatus: true,
        },
      });
      console.log(
        `[syncEmails] Verification: ${inboxThreadCount} inbox threads in database for account ${account.id}`,
      );
    } catch (error) {
      console.error("[syncEmails] Error syncing emails to database:", error);
      throw error;
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

  async syncLatestEmails(): Promise<{
    success: boolean;
    count: number;
    authError?: boolean;
  }> {
    const account = await db.account.findUnique({
      where: {
        id: this.id,
      },
    });
    if (!account) {
      console.error(
        `[syncLatestEmails] Account ${this.id} not found in database`,
      );
      throw new Error("Account not found");
    }

    if (account.token) {
      this.token = account.token;
      console.log(
        `[syncLatestEmails] Using token from database for account ${this.id}`,
      );
    } else {
      console.error(
        `[syncLatestEmails] Account ${this.id} has no token stored`,
      );
      return { success: false, count: 0, authError: true };
    }

    const isTokenValid = await this.validateToken();
    if (!isTokenValid) {
      console.error(
        `[syncLatestEmails] Token validation failed for account ${this.id}`,
      );
      return { success: false, count: 0, authError: true };
    }

    const shouldRefresh = await this.shouldRefresh30DayWindow(account.id);
    if (shouldRefresh) {
      console.log(
        `[Latest Sync] 30-day window needs refresh, doing full sync instead`,
      );
      try {
        await this.syncEmails(true);
        return { success: true, count: 0, authError: false };
      } catch (error) {
        console.error(`[Latest Sync] Full sync failed:`, error);
        const isAuthError =
          axios.isAxiosError(error) && error.response?.status === 401;
        return { success: false, count: 0, authError: isAuthError };
      }
    }

    if (!account.nextDeltaToken) {
      console.log(
        `Skipping latest sync - account ${account.id} needs initial sync first`,
      );
      return { success: false, count: 0, authError: false };
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

        return { success: true, count: newEmails.length, authError: false };
      } else {
        if (response.nextDeltaToken) {
          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: storedDeltaToken },
          });
        }

        const duration = Date.now() - startTime;
        console.log(`[Latest Sync] No new emails (${duration}ms)`);
        return { success: true, count: 0, authError: false };
      }
    } catch (error) {
      console.error(
        `[Latest Sync] Error caught for account ${account.id}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const is401Error =
        axios.isAxiosError(error) && error.response?.status === 401;

      const isAuthErrorMessage =
        errorMessage.includes("Authentication failed") ||
        errorMessage.includes("UNAUTHORIZED") ||
        errorMessage.includes("401");

      const isAuthError = is401Error || isAuthErrorMessage;

      if (isAuthError) {
        console.error(
          `[Latest Sync] Authentication failed for account ${account.id} - token may be expired or invalid`,
        );
        console.error(
          `[Latest Sync] Error details:`,
          axios.isAxiosError(error)
            ? {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
            }
            : errorMessage,
        );


        await db.account.update({
          where: { id: account.id },
          data: { needsReconnection: true },
        }).catch(err => console.error(`[Latest Sync] Failed to update needsReconnection:`, err));

        return { success: false, count: 0, authError: true };
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error(`[Latest Sync] API error for account ${account.id}:`, {
          status,
          statusText: error.response?.statusText,
          data: errorData,
        });

        if (status === 400 || status === 410) {
          console.warn(
            `[Latest Sync] Delta token invalid/expired (${status}) for account ${account.id}, resetting...`,
          );

          await db.account.update({
            where: { id: account.id },
            data: { nextDeltaToken: null },
          });

          console.log(
            `[Latest Sync] Delta token reset - will use full sync on next regular sync`,
          );
          return { success: false, count: 0, authError: false };
        }
      } else {
        console.error(
          `[Latest Sync] Non-axios error syncing latest emails for account ${account.id}:`,
          error,
        );
      }

      return { success: false, count: 0, authError: false };
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

      const listResponse = await aurinkoAxios.get<{
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
        "[fetchAllEmailsDirectly] Starting to fetch all emails (inbox + sent) from last 30 days...",
      );

      try {
        const accountInfo = await aurinkoAxios.get(
          "https://api.aurinko.io/v1/account",
          {
            headers: this.aurinkoHeaders,
          },
        );
        console.log(
          `[fetchAllEmailsDirectly] ✓ API connection verified. Account: ${JSON.stringify(accountInfo.data)}`,
        );
      } catch (authError) {
        if (axios.isAxiosError(authError)) {
          console.error(
            `[fetchAllEmailsDirectly] ✗ API authentication failed: ${authError.response?.status} - ${JSON.stringify(authError.response?.data)}`,
          );


          if (authError.response?.status === 401) {
            await db.account.update({
              where: { id: this.id },
              data: { needsReconnection: true },
            }).catch(err => console.error(`[fetchAllEmailsDirectly] Failed to update needsReconnection:`, err));
          }

          throw new Error(
            `API authentication failed: ${authError.response?.status}. Please reconnect your account.`,
          );
        }
        throw authError;
      }


      console.log("[fetchAllEmailsDirectly] Step 1: Fetching INBOX emails...");
      const inboxEmails = await this.fetchEmailsByFolder("inbox");
      console.log(`[fetchAllEmailsDirectly] ✓ Fetched ${inboxEmails.length} inbox emails`);

      console.log("[fetchAllEmailsDirectly] Step 2: Fetching SENT emails...");
      const sentEmails = await this.fetchEmailsByFolder("sent");
      console.log(`[fetchAllEmailsDirectly] ✓ Fetched ${sentEmails.length} sent emails`);


      const emailMap = new Map<string, EmailMessage>();
      for (const email of [...inboxEmails, ...sentEmails]) {
        if (!emailMap.has(email.id)) {
          emailMap.set(email.id, email);
        }
      }
      const allEmails = Array.from(emailMap.values());
      console.log(`[fetchAllEmailsDirectly] ✓ Total unique emails: ${allEmails.length} (Inbox: ${inboxEmails.length}, Sent: ${sentEmails.length})`);

      return allEmails;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[fetchAllEmailsDirectly] API error:",
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error("[fetchAllEmailsDirectly] Error:", error);
      }
      throw error;
    }
  }

  private async fetchEmailsByFolder(folder: "inbox" | "sent"): Promise<EmailMessage[]> {
    const allEmails: EmailMessage[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 500;
    let consecutiveEmptyPages = 0;
    const maxConsecutiveEmpty = 3;


    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const year = thirtyDaysAgo.getUTCFullYear();
    const month = String(thirtyDaysAgo.getUTCMonth() + 1).padStart(2, "0");
    const day = String(thirtyDaysAgo.getUTCDate()).padStart(2, "0");
    const dateQuery = `after:${year}/${month}/${day}`;

    console.log(`[fetchEmailsByFolder:${folder}] Fetching emails with query: in:${folder} ${dateQuery}`);

    while (pageCount < maxPages) {
      pageCount++;
      console.log(`[fetchEmailsByFolder:${folder}] Fetching page ${pageCount}...`);

      const params: Record<string, string | number> = {
        maxResults: 500,
        bodyType: "text",
        q: `in:${folder} ${dateQuery}`,
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      try {
        const listResponse = await aurinkoAxios.get<{
          messages?: Array<{ id: string }>;
          nextPageToken?: string;
        }>("https://api.aurinko.io/v1/email/messages", {
          headers: this.aurinkoHeaders,
          params,
        });

        const messageIds = listResponse.data.messages?.map((m) => m.id) ?? [];
        console.log(
          `[fetchEmailsByFolder:${folder}] Page ${pageCount}: Found ${messageIds.length} message IDs`,
        );

        if (messageIds.length === 0) {
          consecutiveEmptyPages++;
          console.log(
            `[fetchEmailsByFolder:${folder}] Empty page ${pageCount} (consecutive: ${consecutiveEmptyPages})`,
          );

          if (consecutiveEmptyPages >= maxConsecutiveEmpty || !listResponse.data.nextPageToken) {
            console.log(
              `[fetchEmailsByFolder:${folder}] Stopping - ${consecutiveEmptyPages >= maxConsecutiveEmpty ? 'too many empty pages' : 'no more pages'}`,
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
            `[fetchEmailsByFolder:${folder}] Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messageIds.length / batchSize)}, batch size: ${validEmails.length}, total: ${allEmails.length}`,
          );
        }

        pageToken = listResponse.data.nextPageToken;

        if (!pageToken) {
          console.log(
            `[fetchEmailsByFolder:${folder}] No more pages, finished fetching`,
          );
          break;
        }
      } catch (pageError) {
        console.error(
          `[fetchEmailsByFolder:${folder}] Error on page ${pageCount}:`,
          pageError,
        );

        if (axios.isAxiosError(pageError)) {
          const status = pageError.response?.status;
          if (status === 429 || (status && status >= 500 && status < 600)) {
            console.log(
              `[fetchEmailsByFolder:${folder}] Rate limit or server error, waiting 2 seconds before retry...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
        }

        console.warn(
          `[fetchEmailsByFolder:${folder}] Breaking due to error on page ${pageCount}`,
        );
        break;
      }
    }

    if (pageCount >= maxPages) {
      console.warn(
        `[fetchEmailsByFolder:${folder}] Reached max pages limit (${maxPages}), stopping. Total fetched: ${allEmails.length}`,
      );
    }

    console.log(
      `[fetchEmailsByFolder:${folder}] Complete! Fetched ${allEmails.length} emails across ${pageCount} pages`,
    );

    return allEmails;
  }
}
