import type {
  EmailAddress,
  EmailMessage,
  syncResponse,
  syncUpdateResponse,
} from "@/types";
import axios from "axios";
import pLimit from "p-limit";
import { refreshAurinkoToken } from "./aurinko";
import { syncEmailsToDatabase } from "./sync-to-db";
import { withLock } from "./sync-lock";
import { db } from "@/server/db";

const SYNC_LOCK_TTL_MS = 30 * 60 * 1000;
const DEBUG_EMAIL = process.env.DEBUG_EMAIL_SYNC === "true";
function debugLog(...args: unknown[]) {
  if (DEBUG_EMAIL) console.log(...args);
}

const SYNC_WINDOW_DAYS = 60;

const INITIAL_FIRST_BATCH_SIZE = 250;
const EMAIL_FETCH_BATCH_SIZE = 25;
const FIRST_BATCH_CONCURRENCY = EMAIL_FETCH_BATCH_SIZE;
const INSTANT_SYNC_CONCURRENCY = 200;
const DELAY_BETWEEN_BATCHES_MS = 150;
const INSTANT_SYNC_LIST_SIZE = 500;

const FAST_FIRST_BATCH_INBOX = 10;
const FAST_FIRST_BATCH_SENT = 8;
const FAST_FIRST_BATCH_TRASH = 5;
const FAST_FIRST_FETCH_CONCURRENCY = 10;
const FAST_FIRST_FETCH_TIMEOUT_MS = 6_000;
const FAST_FIRST_LIST_TIMEOUT_MS = 5_000;
const RATE_LIMIT_WAIT_MS = 60_000;

function isRateLimitError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status === 429) return true;
  if (status === 403) {
    const data = error.response?.data as { message?: string; error?: { message?: string } } | string | undefined;
    const msg = typeof data === "string" ? data : String(data?.error?.message ?? (data as { message?: string })?.message ?? data ?? "").toLowerCase();
    return msg.includes("quota exceeded") || msg.includes("ratelimitexceeded") || msg.includes("rate_limit");
  }
  return false;
}

const aurinkoAxios = axios.create({
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out - please try again',
});

const AURINKO_401_RETRIES = 3;
const AURINKO_401_RETRY_DELAY_MS = 1500;

function is401Error(error: unknown): boolean {
  if (axios.isAxiosError(error)) return error.response?.status === 401;
  const msg = error instanceof Error ? error.message : String(error);
  return /401|Authentication failed|UNAUTHORIZED/i.test(msg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function with401Retry<T>(
  accountId: string,
  fn: () => Promise<T>,
  options?: { tryRefresh?: () => Promise<boolean> },
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= AURINKO_401_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!is401Error(error) || attempt === AURINKO_401_RETRIES) break;
      if (options?.tryRefresh) {
        const refreshed = await options.tryRefresh();
        if (refreshed) {
          console.warn(`[accounts] Token refreshed for account ${accountId}, retrying request...`);
          attempt--;
          continue;
        }
        console.warn(
          `[accounts] 401 for account ${accountId}: refresh failed or no refresh token - stopping retries`,
        );
        break;
      }
      const delay = AURINKO_401_RETRY_DELAY_MS * (attempt + 1);
      console.warn(
        `[accounts] 401 on attempt ${attempt + 1}/${AURINKO_401_RETRIES + 1} for account ${accountId}, retrying in ${delay}ms...`,
      );
      await sleep(delay);
    }
  }
  await db.account
    .update({ where: { id: accountId }, data: { needsReconnection: true } })
    .catch((err) => console.error(`[accounts] Failed to update needsReconnection:`, err));
  throw lastError;
}

export class Account {
  private id: string;
  private token: string;

  constructor(id: string, token: string) {
    this.id = id;
    this.token = token;
  }

  async refreshTokenIfPossible(): Promise<boolean> {
    const account = await db.account.findUnique({
      where: { id: this.id },
      select: { refreshToken: true },
    });
    if (!account?.refreshToken) {
      console.warn(`[accounts] No refresh token in DB for account ${this.id} - cannot refresh`);
      return false;
    }
    const result = await refreshAurinkoToken(this.id, account.refreshToken);
    if (!result) {
      console.warn(`[accounts] Aurinko refresh API failed for account ${this.id}`);
      return false;
    }
    const newToken = result.accountToken ?? result.accessToken;
    const tokenExpiresAt = result.expiresIn
      ? new Date(Date.now() + result.expiresIn * 1000)
      : null;
    await db.account.update({
      where: { id: this.id },
      data: {
        token: newToken,
        needsReconnection: false,
        ...(tokenExpiresAt && { tokenExpiresAt }),
      },
    });
    this.token = newToken;
    return true;
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
      debugLog(`[validateToken] Validating token for account ${this.id}...`);

      const response = await with401Retry(
        this.id,
        () =>
          aurinkoAxios.get(
            `https://api.aurinko.io/v1/email/messages`,
            {
              headers: this.aurinkoHeaders,
              params: {
                maxResults: 1,
                bodyType: "text",
              },
              timeout: 10000,
            },
          ),
        { tryRefresh: () => this.refreshTokenIfPossible() },
      );

      debugLog(
        `[validateToken] Token is valid (status: ${response.status})`,
      );

      await db.account.update({
        where: { id: this.id },
        data: { needsReconnection: false },
      }).catch(err => console.error(`[validateToken] Failed to update needsReconnection:`, err));

      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.warn(
            `[validateToken] Token validation timed out for account ${this.id} - treating as temporary network issue`,
          );
          return true;
        }
      }
      if (is401Error(error)) {
        console.error(
          `[validateToken] Token validation failed after retries for account ${this.id}`,
        );
        return false;
      }
      console.warn(
        `[validateToken] Token validation check failed with non-401 error (network/timeout):`,
        error,
      );
      return true;
    }
  }

  async performInitialSync(
    folder?: "inbox" | "sent",
    options?: { firstBatchOnly?: boolean },
  ) {
    try {
      if (folder) {
        debugLog(
          `[Initial Sync] Starting initial sync for ${folder.toUpperCase()} folder only...`,
        );
        const folderEmails = await this.fetchEmailsByFolder(folder);
        await syncEmailsToDatabase(folderEmails, this.id);

        const count = folderEmails.length;
        debugLog(
          `[Initial Sync] Complete! Fetched ${count} ${folder} emails`,
        );

        return {
          emails: folderEmails,
          deltaToken: "",
        };
      }

      if (options?.firstBatchOnly) {
        debugLog(
          `[Initial Sync] Fast first batch only: listing up to ${INITIAL_FIRST_BATCH_SIZE} inbox messages (last ${SYNC_WINDOW_DAYS} days)...`,
        );
        const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;

        const listResponse = await aurinkoAxios.get<{
          messages?: Array<{ id: string }>;
          nextPageToken?: string;
        }>("https://api.aurinko.io/v1/email/messages", {
          headers: this.aurinkoHeaders,
          params: {
            maxResults: INITIAL_FIRST_BATCH_SIZE,
            q: `label:inbox ${newerThanQuery}`,
            bodyType: "text",
          },
        });

        let messageIds = listResponse.data.messages?.map((m) => m.id) ?? [];
        debugLog(
          `[Initial Sync] First batch list returned ${messageIds.length} message IDs (query: label:inbox newer_than:${SYNC_WINDOW_DAYS}d)`,
        );

        if (messageIds.length === 0) {
          debugLog(
            `[Initial Sync] No messages with date filter - trying label:inbox without date limit...`,
          );
          const fallbackResponse = await aurinkoAxios.get<{
            messages?: Array<{ id: string }>;
            nextPageToken?: string;
          }>("https://api.aurinko.io/v1/email/messages", {
            headers: this.aurinkoHeaders,
            params: {
              maxResults: INITIAL_FIRST_BATCH_SIZE,
              q: "label:inbox",
              bodyType: "text",
            },
          });
          messageIds = fallbackResponse.data.messages?.map((m) => m.id) ?? [];
          debugLog(
            `[Initial Sync] Fallback query (label:inbox only) returned ${messageIds.length} message IDs`,
          );
        }

        if (messageIds.length === 0) {
          let storedDeltaToken = "";
          try {
            const syncResponse = await this.startSync();
            if (syncResponse.ready && syncResponse.syncUpdatedToken) {
              storedDeltaToken = syncResponse.syncUpdatedToken;
            }
          } catch {
          }
          console.warn(
            "[Initial Sync] No inbox messages found - account may be empty, or check Aurinko/Gmail connection",
          );
          return { emails: [], deltaToken: storedDeltaToken };
        }

        const firstBatchEmails: EmailMessage[] = [];
        for (let i = 0; i < messageIds.length; i += FIRST_BATCH_CONCURRENCY) {
          const chunk = messageIds.slice(i, i + FIRST_BATCH_CONCURRENCY);
          const chunkResults = await Promise.all(
            chunk.map((id) => this.getEmailById(id)),
          );
          const valid = chunkResults.filter(
            (e): e is EmailMessage => e !== null,
          );
          firstBatchEmails.push(...valid);
        }

        await syncEmailsToDatabase(firstBatchEmails, this.id);
        debugLog(
          `[Initial Sync] First batch: synced ${firstBatchEmails.length} full emails to database`,
        );

        let storedDeltaToken = "";
        try {
          const syncResponse = await this.startSync();
          if (syncResponse.ready && syncResponse.syncUpdatedToken) {
            storedDeltaToken = syncResponse.syncUpdatedToken;
            debugLog(
              `[Initial Sync] Delta token obtained for future syncs`,
            );
          }
        } catch (syncError) {
          console.warn(
            "[Initial Sync] Could not get delta token for first batch, continuing without it:",
            syncError,
          );
        }

        return {
          emails: firstBatchEmails,
          deltaToken: storedDeltaToken,
        };
      }

      debugLog(
        `[Initial Sync] Starting initial sync - fetching ALL inbox emails + sent...`,
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

      debugLog(
        `[Initial Sync] Complete! Fetched ${allEmails.length} emails (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount})`,
      );

      let storedDeltaToken: string = "";
      try {
        const syncResponse = await this.startSync();
        if (syncResponse.ready && syncResponse.syncUpdatedToken) {
          storedDeltaToken = syncResponse.syncUpdatedToken;
          debugLog(
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

  private async startSync(options?: { axiosTimeoutMs?: number }) {
    debugLog("[AURINKO AUTH] Using accountToken for account:", this.id);
    const timeout = options?.axiosTimeoutMs ?? 30_000;

    const data = await with401Retry(
      this.id,
      () =>
        aurinkoAxios
          .post<syncResponse>(
            `https://api.aurinko.io/v1/email/sync`,
            {},
            {
              headers: this.aurinkoHeaders,
              params: {
                daysWithin: SYNC_WINDOW_DAYS,
                bodyType: "html",
                awaitReady: true,
              },
              timeout,
            },
          )
          .then((r) => r.data),
      { tryRefresh: () => this.refreshTokenIfPossible() },
    );
    return data;
  }

  private async getUpdatedEmails(
    deltaToken?: string,
    pageToken?: string,
    metadataOnly: boolean = false,
  ): Promise<syncUpdateResponse> {
    const params: Record<string, string> = {};

    if (pageToken) {
      params.pageToken = pageToken;
    } else if (deltaToken) {
      params.deltaToken = deltaToken;
    }

    if (metadataOnly) {
      params.bodyType = "text";
    } else {
      params.bodyType = "html";
    }

    debugLog(`[getUpdatedEmails] Calling sync/updated with:`, {
      accountId: this.id,
      hasDeltaToken: !!deltaToken,
      hasPageToken: !!pageToken,
      tokenPreview: this.token
        ? `${this.token.substring(0, 20)}...`
        : "MISSING",
    });

    const response = await with401Retry(
      this.id,
      () =>
        aurinkoAxios.get<syncUpdateResponse>(
          `https://api.aurinko.io/v1/email/sync/updated`,
          {
            headers: this.aurinkoHeaders,
            params,
          },
        ),
      { tryRefresh: () => this.refreshTokenIfPossible() },
    );

    debugLog(`[getUpdatedEmails] Response:`, {
      status: response.status,
      recordCount: response.data.records?.length ?? 0,
      hasNextPage: !!response.data.nextPageToken,
      hasNextDelta: !!response.data.nextDeltaToken,
    });

    return response.data;
  }


  async tryGetFirstPageViaSyncApi(
    timeoutMs: number = 18_000,
  ): Promise<{ records: EmailMessage[]; nextPageToken?: string; nextDeltaToken?: string } | null> {
    try {
      const axiosTimeoutMs = Math.max(
        Math.min(timeoutMs - 2_000, 90_000),
        12_000,
      );
      const syncResponse = await Promise.race([
        this.startSync({ axiosTimeoutMs }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sync API start timeout")), timeoutMs),
        ),
      ]);
      if (!syncResponse.ready || !syncResponse.syncUpdatedToken) {
        debugLog("[tryGetFirstPageViaSyncApi] Sync not ready or no token");
        return null;
      }
      const page = await this.getUpdatedEmails(
        syncResponse.syncUpdatedToken,
        undefined,
        false,
      );
      const records = page.records ?? [];
      if (records.length === 0) {
        return {
          records: [],
          nextPageToken: page.nextPageToken,
          nextDeltaToken: page.nextDeltaToken,
        };
      }
      for (const email of records) {
        if (!email.sysLabels.includes("inbox")) {
          email.sysLabels.push("inbox");
        }
      }
      return {
        records,
        nextPageToken: page.nextPageToken,
        nextDeltaToken: page.nextDeltaToken,
      };
    } catch (err) {
      debugLog("[tryGetFirstPageViaSyncApi] Failed:", err);
      return null;
    }
  }

  async getNextPageViaSyncApi(
    pageToken: string,
  ): Promise<{ records: EmailMessage[]; nextPageToken?: string; nextDeltaToken?: string }> {
    const page = await this.getUpdatedEmails(undefined, pageToken, false);
    const records = page.records ?? [];
    for (const email of records) {
      if (!email.sysLabels.includes("inbox")) {
        email.sysLabels.push("inbox");
      }
    }
    return {
      records,
      nextPageToken: page.nextPageToken,
      nextDeltaToken: page.nextDeltaToken,
    };
  }

  async fetchInboxFirstPageInChunks(
    maxIds: number = 20,
    chunkSize: number = 5,
    listTimeoutMs: number = 12_000,
    getTimeoutMs: number = 8_000,
  ): Promise<{ emails: EmailMessage[]; nextPageToken?: string }> {
    const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;
    const listResponse = await with401Retry(
      this.id,
      () =>
        aurinkoAxios.get<{ messages?: Array<{ id: string }>; records?: Array<{ id: string }>; nextPageToken?: string }>(
          "https://api.aurinko.io/v1/email/messages",
          {
            headers: this.aurinkoHeaders,
            params: {
              maxResults: maxIds,
              bodyType: "text",
              q: `label:inbox ${newerThanQuery}`,
            },
            timeout: listTimeoutMs,
          },
        ),
      { tryRefresh: () => this.refreshTokenIfPossible() },
    );
    const messageIds =
      listResponse.data.messages?.map((m) => m.id) ??
      listResponse.data.records?.map((r) => r.id) ??
      [];
    const nextPageToken = listResponse.data.nextPageToken;
    const allEmails: EmailMessage[] = [];
    for (let i = 0; i < messageIds.length; i += chunkSize) {
      const chunk = messageIds.slice(i, i + chunkSize);
      const batchEmails = await Promise.all(
        chunk.map((id) => this.getEmailById(id, getTimeoutMs)),
      );
      const valid = batchEmails.filter((e): e is EmailMessage => e !== null);
      allEmails.push(...valid);
      if (valid.length > 0) {
        await syncEmailsToDatabase(valid, this.id);
      }
    }
    return { emails: allEmails, nextPageToken };
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

      debugLog("sendmail", response.data);
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

  async getEmailById(emailId: string, timeoutMs?: number): Promise<EmailMessage | null> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await aurinkoAxios.get<EmailMessage>(
          `https://api.aurinko.io/v1/email/messages/${emailId}`,
          {
            timeout: timeoutMs ?? 30000,
            headers: this.aurinkoHeaders,
            params: {
              bodyType: "html",
            },
          },
        );
        return response.data;
      } catch (error) {
        const isRateLimit = isRateLimitError(error);
        if (isRateLimit && attempt === 0) {
          await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
          continue;
        }
        if (!isRateLimit) {
          if (axios.isAxiosError(error)) {
            console.error(`Error fetching email ${emailId}:`, error.response?.status, error.response?.data);
          } else {
            console.error(`Error fetching email ${emailId}:`, error);
          }
        }
        return null;
      }
    }
    return null;
  }

  async syncEmails(
    forceFullSync = false,
    folder?: "inbox" | "sent" | "trash",
    options?: { skipRecalculate?: boolean },
  ) {
    const lockKey = folder ? `${this.id}:${folder}` : this.id;
    await withLock(lockKey, SYNC_LOCK_TTL_MS, () =>
      this._performSync(forceFullSync, folder, options),
    );
  }

  async syncAllFoldersInParallel(): Promise<void> {
    const lockKey = `${this.id}:full`;
    await withLock(lockKey, SYNC_LOCK_TTL_MS, async () => {
      const skipRecalculate = { skipRecalculate: true };
      await Promise.all([
        this._performSync(true, undefined, skipRecalculate),
        this._performSync(true, "sent", skipRecalculate),
        this._performSync(true, "trash", skipRecalculate),
      ]);
    });
  }

  private async _performSync(
    forceFullSync = false,
    folder?: "inbox" | "sent" | "trash",
    options?: { skipRecalculate?: boolean },
  ) {
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

    debugLog(
      `[syncEmails] Starting email sync for account ${account.id} (forceFullSync: ${forceFullSync}, folder: ${folder || "all"})`,
    );


    if (folder) {
      debugLog(`[syncEmails] Folder-specific sync requested: ${folder}`);
      try {
        const fetchPromise = this.fetchEmailsByFolder(folder);
        const folderEmails = await fetchPromise;

        debugLog(`[syncEmails] ✓ Fetched ${folderEmails.length} ${folder} emails`);

        if (folderEmails.length > 0) {
          await syncEmailsToDatabase(folderEmails, account.id, {
            skipRecalculate: options?.skipRecalculate,
          });
          debugLog(`[syncEmails] ✓ Synced ${folderEmails.length} ${folder} emails to database`);
        } else {
          debugLog(`[syncEmails] No ${folder} emails found to sync`);
        }

        return;
      } catch (folderError) {
        console.error(`[syncEmails] Folder-specific sync failed:`, folderError);
        throw folderError;
      }
    }

    if (forceFullSync) {
      debugLog(`[syncEmails] User-triggered full sync - using performInitialSync for full inbox+sent fetch`);
      try {
        const initialSyncResult = await this.performInitialSync(undefined, {
          firstBatchOnly: false,
        });
        const allEmails = initialSyncResult?.emails ?? [];
        const storedDeltaToken = initialSyncResult?.deltaToken ?? "";
        debugLog(`[syncEmails] ✓ performInitialSync completed: ${allEmails.length} emails`);
        if (allEmails.length > 0) {
          await syncEmailsToDatabase(allEmails, account.id, {
            skipRecalculate: options?.skipRecalculate,
          });
          debugLog(`[syncEmails] ✓ Synced ${allEmails.length} emails to database`);
        }
        await db.account.update({
          where: { id: account.id },
          data: {
            lastInboxSyncAt: new Date(),
            ...(storedDeltaToken ? { nextDeltaToken: storedDeltaToken } : {}),
          },
        });
        return;
      } catch (fullSyncError) {
        console.error(`[syncEmails] performInitialSync failed, trying direct inbox fetch:`, fullSyncError);
        try {
          const inboxOnly = await this.fetchEmailsByFolder("inbox");
          debugLog(`[syncEmails] ✓ Direct inbox fetch: ${inboxOnly.length} emails`);
          if (inboxOnly.length > 0) {
            await syncEmailsToDatabase(inboxOnly, account.id, {
              skipRecalculate: options?.skipRecalculate,
            });
            await db.account.update({
              where: { id: account.id },
              data: { lastInboxSyncAt: new Date() },
            });
            debugLog(`[syncEmails] ✓ Synced ${inboxOnly.length} inbox emails (fallback path)`);
          }
          return;
        } catch (inboxFallbackError) {
          console.error(`[syncEmails] Direct inbox fallback also failed:`, inboxFallbackError);
        }
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
      debugLog(
        `[syncEmails] Inbox is empty (${inboxThreadCount} threads), forcing full sync regardless of forceFullSync flag`,
      );
    }

    if (shouldMaintain30DayWindow) {
      if (inboxThreadCount === 0) {
        debugLog(
          `[syncEmails] New user (0 inbox threads) - using Sync API (messages list returns empty)`,
        );
      }

      debugLog(
        `[syncEmails] Maintaining ${SYNC_WINDOW_DAYS}-day window - using sync API (primary method)`,
      );

      try {
        debugLog(`[syncEmails] Starting sync API...`);
        let syncResponse = await this.startSync();
        let readyAttempts = 0;
        const maxReadyAttempts = 12;
        while (!syncResponse.ready && readyAttempts < maxReadyAttempts) {
          readyAttempts++;
          debugLog(
            `[syncEmails] Sync not ready, waiting 5s before retry (${readyAttempts}/${maxReadyAttempts})...`,
          );
          await new Promise((r) => setTimeout(r, 5000));
          syncResponse = await this.startSync();
        }
        debugLog(`[syncEmails] Sync API response:`, {
          ready: syncResponse.ready,
          hasToken: !!syncResponse.syncUpdatedToken,
          syncUpdatedToken: syncResponse.syncUpdatedToken
            ? syncResponse.syncUpdatedToken.substring(0, 30) + "..."
            : null,
        });

        if (!syncResponse.ready) {
          throw new Error("Sync API not ready after waiting - try again in a few minutes");
        }

        if (!syncResponse.syncUpdatedToken) {
          throw new Error("Sync API did not return syncUpdatedToken");
        }

        debugLog(
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
          debugLog(
            `[syncEmails] Fetching sync API page ${syncPageCount}...`,
          );

          const syncUpdateResponse = await this.getUpdatedEmails(
            syncPageToken ? undefined : currentDeltaToken,
            syncPageToken,
          );

          debugLog(`[syncEmails] Sync API page ${syncPageCount} response:`, {
            recordCount: syncUpdateResponse.records?.length ?? 0,
            hasNextPage: !!syncUpdateResponse.nextPageToken,
            hasNextDelta: !!syncUpdateResponse.nextDeltaToken,
          });

          if (
            syncUpdateResponse.records &&
            syncUpdateResponse.records.length > 0
          ) {
            const records = syncUpdateResponse.records;
            syncEmails.push(...records);
            for (const email of records) {
              if (!email.sysLabels.includes("inbox")) {
                email.sysLabels.push("inbox");
              }
            }
            await syncEmailsToDatabase(records, account.id);
            consecutiveEmptyPages = 0;
            debugLog(
              `[syncEmails] ✓ Sync API page ${syncPageCount}: ${records.length} emails synced to DB, total: ${syncEmails.length}`,
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
            debugLog(
              `[syncEmails] Received nextDeltaToken - sync window complete`,
            );
          }

          syncPageToken = syncUpdateResponse.nextPageToken;

          if (hasNextDeltaToken && !syncPageToken) {
            debugLog(
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
            debugLog(`[syncEmails] No more pages and sync appears complete`);
            break;
          }
        } while (syncPageCount < maxSyncPages);

        if (syncEmails.length === 0) {
          throw new Error(
            "Sync API returned 0 emails after fetching all pages",
          );
        }

        debugLog(
          `[syncEmails] ✓ Fetched ${syncEmails.length} emails from sync API (already synced per page)`,
        );

        await db.account.update({
          where: { id: account.id },
          data: {
            nextDeltaToken: syncResponse.syncUpdatedToken,
            lastInboxSyncAt: new Date(),
          },
        });

        debugLog(
          `[syncEmails] ✓ ${SYNC_WINDOW_DAYS}-day window sync completed using sync API for account ${account.id}. Synced ${syncEmails.length} emails.`,
        );
        return;
      } catch (syncApiError) {
        console.error("[syncEmails] ✗ Sync API failed:", syncApiError);

        if (is401Error(syncApiError)) {
          console.error(
            `[syncEmails] Authentication failed (401) after retries for account ${this.id}`,
          );
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
    let syncedIncrementally = false;

    if (!updatedAccount.nextDeltaToken) {
      debugLog(
        "[syncEmails] Performing full initial sync (no delta token)...",
      );
      debugLog("[syncEmails] Calling performInitialSync() with full 60-day fetch...");
      const initialSyncResult = await this.performInitialSync(undefined, {
        firstBatchOnly: false,
      });
      allEmails = initialSyncResult?.emails ?? [];
      storedDeltaToken = initialSyncResult?.deltaToken ?? "";
      debugLog(
        `[syncEmails] performInitialSync() completed: ${allEmails.length} emails, deltaToken: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
      );
      await db.account.update({
        where: { id: account.id },
        data: { lastInboxSyncAt: new Date() },
      });
    } else {
      const deltaToken = updatedAccount.nextDeltaToken;
      if (!deltaToken) {
        debugLog(
          "[syncEmails] No delta token found, performing full initial sync...",
        );
        const initialSyncResult = await this.performInitialSync(undefined, {
          firstBatchOnly: false,
        });
        allEmails = initialSyncResult?.emails ?? [];
        storedDeltaToken = initialSyncResult?.deltaToken ?? "";
        debugLog(
          `[syncEmails] performInitialSync() completed: ${allEmails.length} emails, deltaToken: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
        );
        await db.account.update({
          where: { id: account.id },
          data: { lastInboxSyncAt: new Date() },
        });
      } else {
        debugLog(`Using delta token: ${deltaToken.substring(0, 20)}...`);
        let response = await this.getUpdatedEmails(deltaToken);
        allEmails = response.records || [];
        storedDeltaToken = deltaToken;

        debugLog(`Delta sync response: ${allEmails.length} emails found`);

        if (response.nextDeltaToken) {
          storedDeltaToken = response.nextDeltaToken;
          debugLog(`Updated delta token: ${storedDeltaToken}`);
        }

        if (allEmails.length > 0) {
          await syncEmailsToDatabase(allEmails, account.id);
          syncedIncrementally = true;
        }
        while (response.nextPageToken) {
          debugLog(
            `Fetching next page with token: ${response.nextPageToken}`,
          );
          response = await this.getUpdatedEmails("", response.nextPageToken);
          const records = response.records || [];
          allEmails = allEmails.concat(records);
          if (records.length > 0) {
            await syncEmailsToDatabase(records, account.id);
            syncedIncrementally = true;
          }
          debugLog(
            `Page response: ${records.length} emails synced, total: ${allEmails.length}`,
          );
          if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken;
          }
        }
      }
    }

    debugLog(`[syncEmails] Total emails to sync: ${allEmails.length}`);

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
      if (!syncedIncrementally) {
        debugLog(
          `[syncEmails] Starting DB insert for ${allEmails.length} emails...`,
        );
        await syncEmailsToDatabase(allEmails, account.id);
        debugLog(
          `[syncEmails] Successfully synced ${allEmails.length} emails to database`,
        );
      } else {
        debugLog(
          `[syncEmails] Emails already synced incrementally (${allEmails.length} total)`,
        );
      }

      const savedEmailCount = await db.email.count({
        where: {
          thread: {
            accountId: account.id,
          },
        },
      });
      debugLog(
        `[syncEmails] Verification: ${savedEmailCount} total emails in database for account ${account.id}`,
      );

      const threadCount = await db.thread.count({
        where: {
          accountId: account.id,
        },
      });
      debugLog(
        `[syncEmails] Verification: ${threadCount} total threads in database for account ${account.id}`,
      );

      const inboxThreadCount = await db.thread.count({
        where: {
          accountId: account.id,
          inboxStatus: true,
        },
      });
      debugLog(
        `[syncEmails] Verification: ${inboxThreadCount} inbox threads in database for account ${account.id}`,
      );
    } catch (error) {
      console.error("[syncEmails] Error syncing emails to database:", error);
      throw error;
    }

    debugLog(
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
    debugLog(
      `[syncEmails] Delta token updated successfully: ${storedDeltaToken ? storedDeltaToken.substring(0, 20) + "..." : "none"}`,
    );

    debugLog(`[syncEmails] Email sync completed for account ${account.id}`);
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
        debugLog(
          "[shouldRefresh30DayWindow] No delta token found, will do initial sync instead",
        );
        return false;
      }

      if (account.lastInboxSyncAt) {
        const sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        if (account.lastInboxSyncAt > sixHoursAgo) {
          debugLog(
            "[shouldRefresh30DayWindow] Last sync was recent, using delta sync",
          );
          return false;
        }
      }

      debugLog(
        `[shouldRefresh30DayWindow] Last sync was more than 6 hours ago, refreshing ${SYNC_WINDOW_DAYS}-day window`,
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
      debugLog(
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
      debugLog(
        `[Latest Sync] ${SYNC_WINDOW_DAYS}-day window needs refresh, doing full sync instead`,
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
      debugLog(
        `Skipping latest sync - account ${account.id} needs initial sync first`,
      );
      return { success: false, count: 0, authError: false };
    }

    try {
      debugLog(
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
          (e: EmailMessage) =>
            e.sysLabels.includes("inbox") || e.sysLabels.includes("important"),
        ).length;
        const sentCount = newEmails.filter(
          (e: EmailMessage) => e.sysLabels.includes("sent") && !e.sysLabels.includes("draft"),
        ).length;
        const draftCount = newEmails.filter((e: EmailMessage) =>
          e.sysLabels.includes("draft"),
        ).length;

        debugLog(
          `[Latest Sync] Found ${newEmails.length} new emails (Inbox: ${inboxCount}, Sent: ${sentCount}, Drafts: ${draftCount}), syncing...`,
        );

        await syncEmailsToDatabase(newEmails, account.id);

        await db.account.update({
          where: { id: account.id },
          data: { nextDeltaToken: storedDeltaToken },
        });

        const duration = Date.now() - startTime;
        debugLog(
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
        debugLog(`[Latest Sync] No new emails (${duration}ms)`);
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
          `[Latest Sync] Authentication failed for account ${account.id} after retries`,
        );
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

          debugLog(
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

  async fetchAndSyncLatestInboxPage(): Promise<{ count: number }> {
    try {
      const result = await this.fetchEmailsByFolderOnePage(
        "inbox",
        undefined,
        false,
        false,
        false,
        false,
        false,
        false,
        100,
      );
      if (result.emails.length === 0) return { count: 0 };
      await syncEmailsToDatabase(result.emails, this.id);
      debugLog(
        `[fetchAndSyncLatestInboxPage] Synced ${result.emails.length} latest inbox emails for account ${this.id}`,
      );
      return { count: result.emails.length };
    } catch (error) {
      console.warn("[fetchAndSyncLatestInboxPage] Failed (inbox will use existing DB):", error);
      return { count: 0 };
    }
  }

  async syncFirstBatchQuick(): Promise<{ count: number }> {
    const start = Date.now();
    const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;
    const listOpts = { timeout: FAST_FIRST_LIST_TIMEOUT_MS };
    const limit = pLimit(FAST_FIRST_FETCH_CONCURRENCY);

    const listInbox = () =>
      with401Retry(this.id, () =>
        aurinkoAxios.get<{ messages?: Array<{ id: string }> }>(
          "https://api.aurinko.io/v1/email/messages",
          {
            ...listOpts,
            headers: this.aurinkoHeaders,
            params: {
              maxResults: FAST_FIRST_BATCH_INBOX,
              bodyType: "text",
              q: `label:inbox ${newerThanQuery}`,
            },
          },
        ),
        { tryRefresh: () => this.refreshTokenIfPossible() },
      );
    const listSent = () =>
      with401Retry(this.id, () =>
        aurinkoAxios.get<{ messages?: Array<{ id: string }> }>(
          "https://api.aurinko.io/v1/email/messages",
          {
            ...listOpts,
            headers: this.aurinkoHeaders,
            params: {
              maxResults: FAST_FIRST_BATCH_SENT,
              bodyType: "text",
              q: `label:sent ${newerThanQuery}`,
            },
          },
        ),
        { tryRefresh: () => this.refreshTokenIfPossible() },
      );
    const listTrash = () =>
      with401Retry(this.id, () =>
        aurinkoAxios.get<{ messages?: Array<{ id: string }> }>(
          "https://api.aurinko.io/v1/email/messages",
          {
            ...listOpts,
            headers: this.aurinkoHeaders,
            params: {
              maxResults: FAST_FIRST_BATCH_TRASH,
              bodyType: "text",
              q: `label:trash ${newerThanQuery}`,
            },
          },
        ),
        { tryRefresh: () => this.refreshTokenIfPossible() },
      );

    const [inboxRes, sentRes, trashRes] = await Promise.all([listInbox(), listSent(), listTrash()]);
    const inboxIds = inboxRes.data.messages?.map((m) => m.id) ?? [];
    const sentIds = sentRes.data.messages?.map((m) => m.id) ?? [];
    const trashIds = trashRes.data.messages?.map((m) => m.id) ?? [];

    const CHUNK_SIZE = 5;
    const fetchAndSyncInChunks = async (ids: string[]): Promise<number> => {
      let total = 0;
      for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        const emails = await Promise.all(
          chunk.map((id) => limit(() => this.getEmailById(id, FAST_FIRST_FETCH_TIMEOUT_MS))),
        );
        const valid = emails.filter((e): e is EmailMessage => e !== null);
        if (valid.length > 0) {
          await syncEmailsToDatabase(valid, this.id, { writeConcurrency: 15, skipRecalculate: false });
          total += valid.length;
        }
      }
      return total;
    };

    const inboxCount = await fetchAndSyncInChunks(inboxIds);
    const [sentCount, trashCount] = await Promise.all([
      fetchAndSyncInChunks(sentIds),
      fetchAndSyncInChunks(trashIds),
    ]);

    const total = inboxCount + sentCount + trashCount;
    const elapsed = Date.now() - start;
    console.log(
      `[syncFirstBatchQuick] ✓ inbox ${inboxCount} sent ${sentCount} trash ${trashCount} (total ${total}) in ${elapsed}ms`,
    );
    return { count: total };
  }

  async syncAllEmailsInstant(): Promise<{ count: number }> {
    const start = Date.now();
    const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;

    const listOpts = { timeout: 10_000 };
    const listInbox = () =>
      aurinkoAxios.get<{ messages?: Array<{ id: string }> }>(
        "https://api.aurinko.io/v1/email/messages",
        {
          ...listOpts,
          headers: this.aurinkoHeaders,
          params: {
            maxResults: INSTANT_SYNC_LIST_SIZE,
            bodyType: "text",
            q: `label:inbox ${newerThanQuery}`,
          },
        },
      );

    const listSent = () =>
      aurinkoAxios.get<{ messages?: Array<{ id: string }> }>(
        "https://api.aurinko.io/v1/email/messages",
        {
          ...listOpts,
          headers: this.aurinkoHeaders,
          params: {
            maxResults: INSTANT_SYNC_LIST_SIZE,
            bodyType: "text",
            q: `label:sent ${newerThanQuery}`,
          },
        },
      );

    const [inboxRes, sentRes] = await Promise.all([
      with401Retry(this.id, listInbox, {
        tryRefresh: () => this.refreshTokenIfPossible(),
      }),
      with401Retry(this.id, listSent, {
        tryRefresh: () => this.refreshTokenIfPossible(),
      }),
    ]);

    const inboxIds = inboxRes.data.messages?.map((m) => m.id) ?? [];
    const sentIds = sentRes.data.messages?.map((m) => m.id) ?? [];
    const allIds = [...new Set([...inboxIds, ...sentIds])];

    if (allIds.length === 0) {
      debugLog("[syncAllEmailsInstant] No message IDs from list, skipping fetch");
      return { count: 0 };
    }

    debugLog(
      `[syncAllEmailsInstant] Listed ${inboxIds.length} inbox + ${sentIds.length} sent = ${allIds.length} unique IDs, fetching with concurrency ${INSTANT_SYNC_CONCURRENCY}...`,
    );

    const limit = pLimit(INSTANT_SYNC_CONCURRENCY);
    const emails = await Promise.all(
      allIds.map((id) =>
        limit(() => this.getEmailById(id, 10_000)),
      ),
    );
    const valid = emails.filter((e): e is EmailMessage => e !== null);

    await syncEmailsToDatabase(valid, this.id, { writeConcurrency: 30 });
    const elapsed = Date.now() - start;
    debugLog(
      `[syncAllEmailsInstant] ✓ Synced ${valid.length} emails in ${elapsed}ms`,
    );
    return { count: valid.length };
  }

  async fetchAllEmailsDirectly(): Promise<EmailMessage[]> {
    try {
      debugLog(
        `[fetchAllEmailsDirectly] Starting to fetch all inbox emails + sent (last ${SYNC_WINDOW_DAYS}d)...`,
      );

      await with401Retry(
        this.id,
        () =>
          aurinkoAxios.get("https://api.aurinko.io/v1/account", {
            headers: this.aurinkoHeaders,
          }),
        { tryRefresh: () => this.refreshTokenIfPossible() },
      );
      debugLog(
        `[fetchAllEmailsDirectly] ✓ API connection verified for account ${this.id}`,
      );


      debugLog("[fetchAllEmailsDirectly] Step 1: Fetching INBOX emails...");
      const inboxEmails = await this.fetchEmailsByFolder("inbox");
      debugLog(`[fetchAllEmailsDirectly] ✓ Fetched ${inboxEmails.length} inbox emails`);

      debugLog("[fetchAllEmailsDirectly] Step 2: Fetching SENT emails...");
      const sentEmails = await this.fetchEmailsByFolder("sent");
      debugLog(`[fetchAllEmailsDirectly] ✓ Fetched ${sentEmails.length} sent emails`);


      const emailMap = new Map<string, EmailMessage>();
      for (const email of [...inboxEmails, ...sentEmails]) {
        if (!emailMap.has(email.id)) {
          emailMap.set(email.id, email);
        }
      }
      const allEmails = Array.from(emailMap.values());
      debugLog(`[fetchAllEmailsDirectly] ✓ Total unique emails: ${allEmails.length} (Inbox: ${inboxEmails.length}, Sent: ${sentEmails.length})`);

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


  async fetchEmailsByFolderOnePage(
    folder: "inbox" | "sent" | "trash",
    pageToken?: string,
    sentUseLabel = false,
    sentOmitDate = false,
    sentUseIsOperator = false,
    sentFromMe = false,
    sentUseLabelIds = false,
    trashUseLabelIds = false,
    maxResults = 500,
    timeoutPerEmailMs?: number,
  ): Promise<{ emails: EmailMessage[]; nextPageToken?: string; sentUseLabel?: boolean; sentOmitDate?: boolean; sentUseIsOperator?: boolean; sentFromMe?: boolean; sentUseLabelIds?: boolean }> {
    const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;
    let searchQuery: string;
    if (folder === "trash") {
      searchQuery = trashUseLabelIds ? "labelIds=TRASH" : "in:trash";
    } else if (folder === "sent") {
      if (sentUseLabelIds) {
        searchQuery = "label:sent";
      } else if (sentFromMe) {
        searchQuery = "from:me";
      } else if (sentUseIsOperator) {
        searchQuery = "is:sent";
      } else if (sentOmitDate) {
        searchQuery = sentUseLabel ? "label:sent" : "in:sent";
      } else {
        searchQuery = sentUseLabel ? `label:sent ${newerThanQuery}` : `in:${folder} ${newerThanQuery}`;
      }
    } else {
      searchQuery = `in:${folder} ${newerThanQuery}`;
    }

    const params: Record<string, string | number> = {
      maxResults,
      bodyType: "text",
      q: searchQuery,
    };
    if (pageToken) params.pageToken = pageToken as string;
    if (folder === "sent" && sentUseLabelIds) {
      delete params.q;
      (params as Record<string, string>)["labelIds"] = "SENT";
    }
    if (folder === "trash" && trashUseLabelIds) {
      delete params.q;
      (params as Record<string, string>)["labelIds"] = "TRASH";
    }

    if (folder === "sent" && !pageToken) {
      debugLog(
        `[fetchEmailsByFolderOnePage:sent] Trying: ${sentUseLabelIds ? "labelIds=SENT" : `q="${searchQuery}"`}`,
      );
    }
    if (folder === "trash" && !pageToken) {
      debugLog(`[fetchEmailsByFolderOnePage:trash] Trying: ${trashUseLabelIds ? "labelIds=TRASH" : "q=in:trash"}`);
    }

    const listResponse = await aurinkoAxios.get<{
      messages?: Array<{ id: string }>;
      nextPageToken?: string;
    }>("https://api.aurinko.io/v1/email/messages", {
      headers: this.aurinkoHeaders,
      params,
    });

    const messageIds = listResponse.data.messages?.map((m) => m.id) ?? [];
    const nextPageToken = listResponse.data.nextPageToken;

    if (folder === "sent" && !pageToken) {
      debugLog(
        `[fetchEmailsByFolderOnePage:sent] Got ${messageIds.length} message IDs for ${sentUseLabelIds ? "labelIds=SENT" : `q="${searchQuery}"`}`,
      );
    }
    if (folder === "trash" && !pageToken) {
      debugLog(`[fetchEmailsByFolderOnePage:trash] Got ${messageIds.length} message IDs for ${trashUseLabelIds ? "labelIds=TRASH" : "q=in:trash"}`);
    }

    if (messageIds.length === 0 && folder === "trash" && !pageToken && !trashUseLabelIds) {
      debugLog(`[fetchEmailsByFolderOnePage:trash] q=in:trash returned 0, retrying with labelIds=TRASH`);
      return this.fetchEmailsByFolderOnePage(folder, undefined, false, false, false, false, false, true, maxResults);
    }

    if (messageIds.length === 0 && folder === "sent" && !pageToken) {
      if (!sentUseLabel) {
        return this.fetchEmailsByFolderOnePage(folder, undefined, true, false, false, false, false);
      }
      if (!sentOmitDate) {
        return this.fetchEmailsByFolderOnePage(folder, undefined, true, true, false, false, false);
      }
      if (!sentUseIsOperator) {
        return this.fetchEmailsByFolderOnePage(folder, undefined, true, true, true, false, false);
      }
      if (!sentFromMe) {
        return this.fetchEmailsByFolderOnePage(folder, undefined, true, true, true, true, false);
      }
      if (!sentUseLabelIds) {
        return this.fetchEmailsByFolderOnePage(folder, undefined, true, true, true, true, true);
      }
    }

    const allEmails: EmailMessage[] = [];
    const batchSize = EMAIL_FETCH_BATCH_SIZE;
    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      const batchEmails = await Promise.all(
        batch.map((id) => this.getEmailById(id, timeoutPerEmailMs)),
      );
      const valid = batchEmails.filter((e): e is EmailMessage => e !== null);
      allEmails.push(...valid);
      if (i + batchSize < messageIds.length && DELAY_BETWEEN_BATCHES_MS > 0) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
      }
    }

    if (folder === "trash" && allEmails.length > 0) {
      for (const email of allEmails) {
        const labels = Array.isArray(email.sysLabels) ? email.sysLabels : [];
        if (!labels.map((l) => String(l).toLowerCase()).includes("trash")) {
          email.sysLabels = [...labels, "trash"];
        }
      }
    }

    return {
      emails: allEmails,
      nextPageToken,
      sentUseLabel: folder === "sent" ? sentUseLabel : undefined,
      sentOmitDate: folder === "sent" ? sentOmitDate : undefined,
      sentUseIsOperator: folder === "sent" ? sentUseIsOperator : undefined,
      sentFromMe: folder === "sent" ? sentFromMe : undefined,
      sentUseLabelIds: folder === "sent" ? sentUseLabelIds : undefined,
    };
  }

  private async getWellKnownSentFolderId(): Promise<string | null> {
    const maxAttempts = 3;
    const delayMs = 800;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await Promise.race([
          aurinkoAxios.get<{ sent?: string }>(
            "https://api.aurinko.io/v1/email/folders/wellKnown",
            { headers: this.aurinkoHeaders, timeout: 5000 },
          ),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("wellKnown folders timeout after 5s")), 5000),
          ),
        ]);
        const id = res.data?.sent ?? null;
        if (id) {
          debugLog("[getWellKnownSentFolderId] Resolved Sent folder id:", id);
        } else {
          debugLog("[getWellKnownSentFolderId] No sent folder in wellKnown response:", res.data);
        }
        return id;
      } catch {
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        debugLog(
          "[getWellKnownSentFolderId] Aurinko well-known folders unavailable after retries; Sent sync will use fallback.",
        );
        return null;
      }
    }
    return null;
  }

  private async fetchEmailsByFolder(folder: "inbox" | "sent" | "trash", maxPagesLimit?: number): Promise<EmailMessage[]> {
    const allEmails: EmailMessage[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = maxPagesLimit ?? 500;
    const pageSize = maxPagesLimit ? 100 : 500;
    let consecutiveEmptyPages = 0;
    const maxConsecutiveEmpty = 3;

    if (folder === "trash") {
      debugLog(`[fetchEmailsByFolder:trash] Fetching emails with labelIds=TRASH`);
    }

    if (folder === "sent") {
      const sentFolderId = await this.getWellKnownSentFolderId();
      if (sentFolderId) {
        try {
          const folderEmails = await this.fetchEmailsByFolderId(sentFolderId, maxPages, pageSize);
          debugLog(
            `[fetchEmailsByFolder:sent] Folder-based fetch complete: ${folderEmails.length} emails`,
          );
          for (const email of folderEmails) {
            const labels = Array.isArray(email.sysLabels) ? email.sysLabels : [];
            if (!labels.map((l) => String(l).toLowerCase()).includes("sent")) {
              email.sysLabels = [...labels, "sent"];
            }
          }
          return folderEmails;
        } catch (err) {
          console.warn("[fetchEmailsByFolder:sent] Folder-based fetch failed, falling back to q/labelIds:", err);
        }
      }
    }

    const newerThanQuery = `newer_than:${SYNC_WINDOW_DAYS}d`;
    const sentQueryOrder: string[] =
      folder === "sent"
        ? [
          "in:sent",
          "label:sent",
          "is:sent",
          `in:sent ${newerThanQuery}`,
          `label:sent ${newerThanQuery}`,
        ]
        : [];
    let sentQueryIndex = 0;
    let sentTriedLabelIds = false;
    let searchQuery =
      folder === "trash"
        ? "in:trash"
        : folder === "sent"
          ? sentQueryOrder[0]!
          : folder === "inbox"
            ? "label:inbox"
            : `label:${folder} ${newerThanQuery}`;
    let triedNoDateFallback = false;
    let trashTriedLabelIds = false;

    debugLog(`[fetchEmailsByFolder:${folder}] Fetching emails with query: ${searchQuery} (window: ${folder === "trash" || folder === "sent" ? "all" : folder === "inbox" ? "all" : SYNC_WINDOW_DAYS + " days"})`);

    while (pageCount < maxPages) {
      pageCount++;
      debugLog(`[fetchEmailsByFolder:${folder}] Fetching page ${pageCount}...`);

      const params: Record<string, string | number> = {
        maxResults: pageSize,
        bodyType: "text",
        ...(folder === "trash" && trashTriedLabelIds ? {} : { q: searchQuery }),
      };
      if (folder === "trash" && trashTriedLabelIds) {
        (params as Record<string, string>)["labelIds"] = "TRASH";
      }
      if (folder === "sent" && sentTriedLabelIds) {
        delete params.q;
        (params as Record<string, string>)["labelIds"] = "SENT";
      }
      if (pageToken) {
        params.pageToken = pageToken;
      }

      let listResponse: { data: { messages?: Array<{ id: string }>; records?: Array<{ id: string }>; nextPageToken?: string } };
      const listMaxRetries = 3;
      for (let listAttempt = 0; listAttempt < listMaxRetries; listAttempt++) {
        try {
          listResponse = await aurinkoAxios.get<{
            messages?: Array<{ id: string }>;
            records?: Array<{ id: string }>;
            nextPageToken?: string;
          }>("https://api.aurinko.io/v1/email/messages", {
            headers: this.aurinkoHeaders,
            params,
          });
          break;
        } catch (listErr) {
          if (isRateLimitError(listErr) && listAttempt < listMaxRetries - 1) {
            console.warn(`[fetchEmailsByFolder:${folder}] List page ${pageCount} rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s then retry (${listAttempt + 1}/${listMaxRetries})`);
            await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
            continue;
          }
          throw listErr;
        }
      }
      const listData = listResponse!;
      try {
        const messageIds =
          listData.data.messages?.map((m) => m.id) ??
          listData.data.records?.map((r) => r.id) ??
          [];
        const paramDesc = folder === "trash" ? (trashTriedLabelIds ? "labelIds=TRASH" : `q="${searchQuery}"`) : folder === "sent" && sentTriedLabelIds ? "labelIds=SENT" : `q="${searchQuery}"`;
        debugLog(
          `[fetchEmailsByFolder:${folder}] Page ${pageCount}: Found ${messageIds.length} message IDs for ${paramDesc}`,
        );

        if (messageIds.length === 0) {
          consecutiveEmptyPages++;
          debugLog(
            `[fetchEmailsByFolder:${folder}] Empty page ${pageCount} (consecutive: ${consecutiveEmptyPages})`,
          );

          if (folder === "sent" && pageCount === 1 && !sentTriedLabelIds && sentQueryIndex >= sentQueryOrder.length - 1) {
            sentTriedLabelIds = true;
            pageToken = undefined;
            pageCount--;
            consecutiveEmptyPages = 0;
            debugLog(`[fetchEmailsByFolder:sent] All q= queries returned 0, trying labelIds=SENT`);
            continue;
          }

          if (folder === "sent" && pageCount === 1 && sentQueryIndex < sentQueryOrder.length - 1) {
            sentQueryIndex++;
            searchQuery = sentQueryOrder[sentQueryIndex]!;
            pageToken = undefined;
            pageCount--;
            consecutiveEmptyPages = 0;
            debugLog(`[fetchEmailsByFolder:sent] Retrying with: ${searchQuery}`);
            continue;
          }

          if (folder === "trash" && pageCount === 1 && !trashTriedLabelIds) {
            trashTriedLabelIds = true;
            pageToken = undefined;
            pageCount--;
            consecutiveEmptyPages = 0;
            searchQuery = "in:trash";
            debugLog(`[fetchEmailsByFolder:trash] q=in:trash returned 0 on first page, trying labelIds=TRASH`);
            continue;
          }

          if (
            pageCount === 1 &&
            !triedNoDateFallback &&
            folder !== "sent" &&
            folder !== "trash"
          ) {
            triedNoDateFallback = true;
            searchQuery = `label:${folder}`;
            pageToken = undefined;
            debugLog(
              `[fetchEmailsByFolder:${folder}] First page empty with date filter, retrying with: ${searchQuery}`,
            );
            pageCount--;
            continue;
          }

          if (consecutiveEmptyPages >= maxConsecutiveEmpty || !listData.data.nextPageToken) {
            debugLog(
              `[fetchEmailsByFolder:${folder}] Stopping - ${consecutiveEmptyPages >= maxConsecutiveEmpty ? 'too many empty pages' : 'no more pages'}`,
            );
            break;
          }

          pageToken = listData.data.nextPageToken;
          continue;
        }

        consecutiveEmptyPages = 0;

        const batchSize = EMAIL_FETCH_BATCH_SIZE;
        for (let i = 0; i < messageIds.length; i += batchSize) {
          const batch = messageIds.slice(i, i + batchSize);
          let batchEmails = await Promise.all(
            batch.map((id) => this.getEmailById(id)),
          );

          let validEmails = batchEmails.filter(
            (e): e is EmailMessage => e !== null,
          );
          const failedIds = batch.filter((_, idx) => batchEmails[idx] === null);

          if (failedIds.length > 0 && failedIds.length <= batchSize) {
            await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
            const retryEmails = await Promise.all(
              failedIds.map((id) => this.getEmailById(id)),
            );
            validEmails = [...validEmails, ...retryEmails.filter((e): e is EmailMessage => e !== null)];
          }

          allEmails.push(...validEmails);

          debugLog(
            `[fetchEmailsByFolder:${folder}] Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messageIds.length / batchSize)}, batch size: ${validEmails.length}, total: ${allEmails.length}`,
          );
          if (i + batchSize < messageIds.length && DELAY_BETWEEN_BATCHES_MS > 0) {
            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
          }
        }

        pageToken = listData.data.nextPageToken;

        if (!pageToken) {
          debugLog(
            `[fetchEmailsByFolder:${folder}] No more pages, finished fetching`,
          );
          break;
        }
      } catch (pageError) {
        if (isRateLimitError(pageError)) {
          console.warn(`[fetchEmailsByFolder:${folder}] Page ${pageCount} rate limited (Gmail quota), waiting ${RATE_LIMIT_WAIT_MS / 1000}s before retry...`);
          await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
          pageCount--;
          continue;
        }
        console.error(`[fetchEmailsByFolder:${folder}] Error on page ${pageCount}:`, axios.isAxiosError(pageError) ? pageError.response?.status : pageError);

        if (axios.isAxiosError(pageError)) {
          const status = pageError.response?.status;
          if (status && status >= 500 && status < 600) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
        }

        console.warn(`[fetchEmailsByFolder:${folder}] Breaking due to error on page ${pageCount}`);
        break;
      }
    }

    if (pageCount >= maxPages) {
      console.warn(
        `[fetchEmailsByFolder:${folder}] Reached max pages limit (${maxPages}), stopping. Total fetched: ${allEmails.length}`,
      );
    }

    debugLog(
      `[fetchEmailsByFolder:${folder}] Complete! Fetched ${allEmails.length} emails across ${pageCount} pages`,
    );

    if (folder === "sent" && allEmails.length > 0) {
      for (const email of allEmails) {
        const labels = Array.isArray(email.sysLabels) ? email.sysLabels : [];
        if (!labels.map((l) => String(l).toLowerCase()).includes("sent")) {
          email.sysLabels = [...labels, "sent"];
        }
      }
    }
    if (folder === "trash" && allEmails.length > 0) {
      for (const email of allEmails) {
        const labels = Array.isArray(email.sysLabels) ? email.sysLabels : [];
        if (!labels.map((l) => String(l).toLowerCase()).includes("trash")) {
          email.sysLabels = [...labels, "trash"];
        }
      }
    }

    return allEmails;
  }

  private async fetchEmailsByFolderId(
    folderId: string,
    maxPages: number,
    pageSize: number,
  ): Promise<EmailMessage[]> {
    const allEmails: EmailMessage[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    const url = `https://api.aurinko.io/v1/email/folders/${encodeURIComponent(folderId)}/messages`;

    while (pageCount < maxPages) {
      pageCount++;
      const params: Record<string, string | number> = {
        maxResults: pageSize,
        bodyType: "text",
      };
      if (pageToken) params.pageToken = pageToken;

      const listResponse = await aurinkoAxios.get<{
        messages?: Array<{ id: string }>;
        records?: Array<{ id: string }>;
        nextPageToken?: string;
      }>(url, {
        headers: this.aurinkoHeaders,
        params,
      });

      const messageIds =
        listResponse.data.records?.map((r) => r.id) ??
        listResponse.data.messages?.map((m) => m.id) ??
        [];
      debugLog(
        `[fetchEmailsByFolderId] Page ${pageCount}: ${messageIds.length} message IDs (folderId: ${folderId})`,
      );

      if (messageIds.length > 0) {
        const batchSize = EMAIL_FETCH_BATCH_SIZE;
        for (let i = 0; i < messageIds.length; i += batchSize) {
          const batch = messageIds.slice(i, i + batchSize);
          const batchEmails = await Promise.all(
            batch.map((id) => this.getEmailById(id)),
          );
          const valid = batchEmails.filter((e): e is EmailMessage => e !== null);
          allEmails.push(...valid);
          if (i + batchSize < messageIds.length && DELAY_BETWEEN_BATCHES_MS > 0) {
            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
          }
        }
      }

      pageToken = listResponse.data.nextPageToken;
      if (!pageToken) break;
    }

    return allEmails;
  }
}
