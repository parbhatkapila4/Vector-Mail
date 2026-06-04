import React, { useRef, useCallback, useMemo, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { MoreVertical, RefreshCw, Mail, MailOpen, Star, Bell, CalendarClock, X, Trash2, Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, type RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { UNIFIED_INBOX_ACCOUNT_ID } from "../AccountSwitcher";
import { isSearchingAtom, searchValueAtom } from "../search/SearchBar";
import { SearchResults } from "../search/SearchResults";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { SnoozeMenu } from "./SnoozeMenu";
import type { InfiniteData } from "@tanstack/react-query";
import { RemindMenu } from "./RemindMenu";
import { ThreadListSkeleton } from "./ThreadListSkeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { DEMO_ACCOUNT_ID } from "@/lib/demo/constants";
import { trackInboxBrainEvent } from "@/lib/analytics/inbox-brain";
import { shouldKeepPreviewReadOnly } from "@/lib/mail/preview-lock";

interface ThreadListProps {
  onThreadSelect?: (threadId: string) => void;
  onSyncPendingChange?: (pending: boolean) => void;
}

export interface ThreadListRef {
  triggerSync: () => void;
  cycleBriefFocus: () => void;
}

type RouterThread = RouterOutputs["account"]["getThreads"]["threads"][0];

type AvatarColor = {
  h: number;
  s: number;
  l: number;
};

const AVATAR_PALETTE: ReadonlyArray<AvatarColor> = [
  { h: 222, s: 32, l: 42 },
  { h: 200, s: 38, l: 38 },
  { h: 178, s: 40, l: 32 },
  { h: 158, s: 32, l: 34 },
  { h: 92, s: 28, l: 36 },
  { h: 38, s: 42, l: 40 },
  { h: 22, s: 42, l: 42 },
  { h: 10, s: 38, l: 42 },
  { h: 348, s: 36, l: 42 },
  { h: 322, s: 32, l: 42 },
  { h: 288, s: 30, l: 42 },
  { h: 264, s: 30, l: 42 },
  { h: 240, s: 30, l: 44 },
  { h: 28, s: 25, l: 36 },
];

function hashString(input: string): number {
  let hash = 5381;
  const s = input.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getAvatarInitials(name: string): string {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  const firstChar = cleaned.replace(/^[^\p{L}\p{N}]+/u, "");
  const words = firstChar
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (words.length === 0) return cleaned.slice(0, 1).toUpperCase();
  if (words.length === 1) return words[0]!.slice(0, 1).toUpperCase();
  return (
    (words[0]?.[0] ?? "").toUpperCase() +
    (words[1]?.[0] ?? "").toUpperCase()
  );
}

function getAvatarStyle(
  name: string,
  isUnread: boolean,
): React.CSSProperties {
  const tone =
    AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length] ??
    AVATAR_PALETTE[0]!;
  const sat = isUnread ? Math.min(tone.s + 6, 50) : tone.s;
  const top = `hsl(${tone.h} ${sat}% ${tone.l}%)`;
  const bottom = `hsl(${tone.h} ${sat}% ${tone.l - 6}%)`;
  return {
    backgroundColor: top,
    backgroundImage: `linear-gradient(160deg, ${top} 0%, ${bottom} 100%)`,
    boxShadow: [
      "inset 0 0 0 1px rgba(255,255,255,0.08)",
      "inset 0 1px 0 rgba(255,255,255,0.16)",
      "0 1px 2px rgba(15,20,40,0.10)",
      "0 2px 6px rgba(15,20,40,0.08)",
    ].join(", "),
    color: "#ffffff",
  };
}

const MAIL_SUBDOMAIN_PREFIX =
  /^(mail|mailer|mailing|email|e|m|news|newsletter|marketing|mktg|promo|promos|promotions?|notification[s]?|notify|alert[s]?|no-?reply|do-?not-?reply|info|hello|hi|support|contact|reply|update[s]?|billing|invoice[s]?|sales|account[s]?|offers?|deals?|smtp|relay|mta|rmp)\./i;

function stripMailSubdomain(domain: string): string {
  const stripped = domain.replace(MAIL_SUBDOMAIN_PREFIX, "");
  return stripped.includes(".") ? stripped : domain;
}

function getLogoProviders(domain: string): ReadonlyArray<string> {
  const root = stripMailSubdomain(domain);
  const encFull = encodeURIComponent(domain);
  const encRoot = encodeURIComponent(root);
  const list: string[] = [];
  if (root !== domain) {
    list.push(`https://icons.duckduckgo.com/ip3/${encRoot}.ico`);
  }
  list.push(`https://icons.duckduckgo.com/ip3/${encFull}.ico`);
  list.push(`https://www.google.com/s2/favicons?domain=${encFull}&sz=128`);
  return list;
}

const PERSONAL_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.in",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "fastmail.com",
  "zoho.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "rediffmail.com",
  "rocketmail.com",
  "tutanota.com",
  "duck.com",
]);

function getSenderDomain(address: string | null | undefined): string | null {
  if (!address) return null;
  const at = address.lastIndexOf("@");
  if (at < 0 || at === address.length - 1) return null;
  const raw = address.slice(at + 1).trim().toLowerCase();
  const domain = raw.replace(/[>\s,;]+$/g, "");
  if (!domain || !domain.includes(".")) return null;
  return domain;
}

function shouldUseLogoForDomain(domain: string | null): boolean {
  if (!domain) return false;
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) return false;
  for (const personal of PERSONAL_EMAIL_DOMAINS) {
    if (domain.endsWith("." + personal)) return false;
  }
  return true;
}

interface SenderAvatarProps {
  fromName: string;
  fromAddress: string | null | undefined;
  isUnread: boolean;
}

const SenderAvatar = React.memo(function SenderAvatar({
  fromName,
  fromAddress,
  isUnread,
}: SenderAvatarProps) {
  const domain = React.useMemo(
    () => getSenderDomain(fromAddress),
    [fromAddress],
  );
  const canTryLogo = shouldUseLogoForDomain(domain);
  const providers = React.useMemo(
    () => (domain && canTryLogo ? getLogoProviders(domain) : []),
    [domain, canTryLogo],
  );
  const [providerIdx, setProviderIdx] = React.useState(0);
  const [logoLoaded, setLogoLoaded] = React.useState(false);

  React.useEffect(() => {
    setProviderIdx(0);
    setLogoLoaded(false);
  }, [domain]);

  const currentSrc =
    providerIdx < providers.length ? providers[providerIdx] : null;
  const initialsStyle: React.CSSProperties = getAvatarStyle(fromName, isUnread);

  return (
    <span
      className="email-from-icon"
      style={initialsStyle}
      data-has-logo={logoLoaded ? "true" : undefined}
    >
      <span className="email-from-icon-initials" aria-hidden={logoLoaded}>
        {getAvatarInitials(fromName)}
      </span>
      {currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          className="email-from-icon-logo"
          src={currentSrc}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth < 16 || img.naturalHeight < 16) {
              setProviderIdx((i) => i + 1);
              return;
            }
            setLogoLoaded(true);
          }}
          onError={() => {
            setLogoLoaded(false);
            setProviderIdx((i) => i + 1);
          }}
          data-loaded={logoLoaded ? "true" : "false"}
        />
      ) : null}
    </span>
  );
});

const CATEGORY_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  promotions: {
    label: "Promotions",
    className: "tag t-promo",
  },
  social: {
    label: "Social",
    className: "tag t-update",
  },
  updates: {
    label: "Updates",
    className: "tag t-update",
  },
  forums: {
    label: "Forums",
    className: "tag t-reply",
  },
};

interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  emails: Array<{
    from?: { name?: string | null; address?: string | null };
    bodySnippet?: string | null;
    sysLabels: string[];
    sysClassifications?: string[];
  }>;
}

interface GroupedThreads {
  [date: string]: Thread[];
}

type FocusView = "all" | "needsReply" | "important" | "lowPriority";

function accountLowerForThreadRow(
  thread: Thread & { accountEmail?: string },
  isUnifiedView: boolean,
  inboxAccountEmail: string | undefined,
): string {
  if (isUnifiedView && thread.accountEmail) {
    return thread.accountEmail.toLowerCase();
  }
  return (inboxAccountEmail ?? "").toLowerCase();
}
function threadMatchesNeedsReplyFocus(
  thread: Thread,
  accountEmailLower: string,
): boolean {
  if (!accountEmailLower) return false;
  const latest = thread.emails?.[0];
  const from = (latest?.from?.address ?? "").toLowerCase();
  if (!from || from === accountEmailLower) return false;
  const sysC = (latest?.sysClassifications ?? []).map((s) =>
    String(s).toLowerCase(),
  );
  if (
    sysC.some((c) =>
      ["promotions", "social", "updates", "forums"].includes(c),
    )
  ) {
    return false;
  }
  return true;
}

const CONNECTION_ERROR_MESSAGES = {
  NO_ACCOUNT: "Connect your inbox",
  CONNECT_DESCRIPTION:
    "Connect the same Google account you use to sign in to manage your email with AI.",
  CONNECT_BUTTON: "Connect your Google account",
} as const;

const MAX_AUTO_CONTINUE_SYNC_PAGES = 5000;
const SYNC_POLL_INTERVAL_MS = 4000;
const MAX_REFRESHES_WHILE_SYNC = 6;
const RECURRING_SYNC_INTERVAL_MS = 30_000;
const PREVIEW_READ_ONLY_MAX_MS = 25_000;
const RECONNECT_UI_MUTE_MS = 90_000;
const RECONNECT_UI_MUTE_KEY = "vm-reconnect-ui-muted-until";

export const ThreadList = forwardRef<ThreadListRef, ThreadListProps>(function ThreadList(
  { onThreadSelect, onSyncPendingChange },
  ref,
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    threads: rawThreads,
    threadId,
    setThreadId,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    accountId,
    effectiveAccountId,
    isUnifiedView,
    refetch,
    selectedLabelId,
    account: validatedAccount,
    backfillComplete,
  } = useThreads();
  const threads = rawThreads as (RouterThread & { accountEmail?: string; accountName?: string })[] | undefined;
  const [isSearching] = useAtom(isSearchingAtom);
  const [searchValue] = useAtom(searchValueAtom);
  const [currentTab] = useLocalStorage<string>("vector-mail", "inbox");
  const [important] = useLocalStorage("vector-mail-important", false);
  const [unread] = useLocalStorage("vector-mail-unread", false);
  const [refreshingAfterSync, setRefreshingAfterSync] = React.useState(false);
  const [loadingMoreAtListEnd, setLoadingMoreAtListEnd] = React.useState(false);
  const [focusView, setFocusView] = React.useState<FocusView>("all");
  const [slowLoad, setSlowLoad] = React.useState(false);
  const slowLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedThreadIds, setSelectedThreadIds] = React.useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [previewStartedAtMs, setPreviewStartedAtMs] = React.useState<number | null>(null);
  const [previewNowMs, setPreviewNowMs] = React.useState(() => Date.now());
  const previewRecoveryTriggeredRef = useRef(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isDemo = useDemoMode() && accountId === DEMO_ACCOUNT_ID;
  const badgeAccountId = (isUnifiedView ? effectiveAccountId : accountId) ?? "";
  const visibleThreadIds = useMemo(
    () => (threads ?? []).map((t) => t.id).filter(Boolean).slice(0, 100),
    [threads],
  );
  const followUpBadgesQuery = api.automation.getThreadAutoFollowUpBadges.useQuery(
    { accountId: badgeAccountId.trim(), threadIds: visibleThreadIds },
    {
      enabled:
        !isUnifiedView &&
        badgeAccountId.trim().length > 0 &&
        badgeAccountId !== UNIFIED_INBOX_ACCOUNT_ID &&
        visibleThreadIds.length > 0,
      staleTime: 30_000,
    },
  );
  const followUpBadgeByThreadId = followUpBadgesQuery.data?.byThreadId ?? {};
  const utils = api.useUtils();
  const quickSyncTriggeredRef = useRef(false);
  const firstBatchTriggeredRef = useRef(false);
  const backgroundSyncTriggeredRef = useRef(false);
  const autoContinueSyncCountRef = useRef(0);
  const reconnectUiMutedUntilRef = useRef(0);
  const muteReconnectUi = useCallback((durationMs: number = RECONNECT_UI_MUTE_MS) => {
    const until = Date.now() + durationMs;
    reconnectUiMutedUntilRef.current = until;
    try {
      window.sessionStorage.setItem(RECONNECT_UI_MUTE_KEY, String(until));
    } catch {
    }
  }, []);
  const isReconnectUiMuted = useCallback(
    () => Date.now() < reconnectUiMutedUntilRef.current,
    [],
  );

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RECONNECT_UI_MUTE_KEY);
      const parsed = raw ? Number(raw) : 0;
      reconnectUiMutedUntilRef.current = Number.isFinite(parsed) ? parsed : 0;
    } catch {
      reconnectUiMutedUntilRef.current = 0;
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("reconnected") === "1") {
      muteReconnectUi();
      quickSyncTriggeredRef.current = false;
      firstBatchTriggeredRef.current = false;
      backgroundSyncTriggeredRef.current = false;
      toast.success("Account reconnected", {
        description: "Your email is connected again. Syncing now.",
        duration: 4000,
      });
      void utils.account.getAccounts.invalidate();
      void utils.account.getMyAccount.invalidate();
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      const url = new URL(window.location.href);
      url.searchParams.delete("reconnected");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    if (searchParams.get("reconnect_failed") === "1") {
      quickSyncTriggeredRef.current = false;
      firstBatchTriggeredRef.current = false;
      backgroundSyncTriggeredRef.current = false;
      toast.error("Reconnect didn’t complete", {
        description: "Auth failed right after connecting. Please try reconnecting again or check your Google account.",
        duration: 5000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("reconnect_failed");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    const errorParam = searchParams.get("error");
    if (errorParam === "account_mismatch") {
      toast.error("Use the same Google account", {
        description: "Please connect the same Google account you used to sign in. Sign out and sign in with the correct account if needed.",
        duration: 8000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname + url.search);
    } else if (errorParam === "one_account_only") {
      toast.error("One account per user", {
        description: "You already have a connected account. We use a single Google account per user.",
        duration: 6000,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, utils, muteReconnectUi]);

  useEffect(() => {
    setSelectedThreadIds(new Set());
  }, [currentTab]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedThreadIds(new Set()), []);

  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      refetchOnWindowFocus: true,
      staleTime: 90 * 1000,
    });

  const syncCancelledRef = useRef(false);
  const wasUnmountedRef = useRef(false);
  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const lastContinueTokenRef = useRef<string | null>(null);
  const accountsInvalidatedOnMountRef = useRef(false);
  useEffect(() => {
    if (accountsInvalidatedOnMountRef.current) return;
    accountsInvalidatedOnMountRef.current = true;
    void utils.account.getAccounts.invalidate();
  }, [utils.account.getAccounts]);
  useEffect(() => {
    wasUnmountedRef.current = false;
    return () => {
      wasUnmountedRef.current = true;
      pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  const scheduleSafe = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);
      if (wasUnmountedRef.current) return;
      fn();
    }, ms);
    pendingTimeoutsRef.current.add(id);
    return id;
  }, []);

  const syncFirstBatchQuickMutation = api.account.syncFirstBatchQuick.useMutation({
    onSuccess: async () => {
      void utils.account.getAccounts.invalidate();
      void utils.account.getThreads.invalidate();
      void utils.account.getNumThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
      await refetch();
      scheduleSafe(() => void refetch(), 800);
    },
    onError: (error) => {
      console.warn("[ThreadList] Quick first sync:", error.message);
      if (/timed out|Initial mail fetch/i.test(error.message)) {
        toast.info("Still reaching your mail provider…", {
          description: "Tap Sync if threads don’t show up in a minute.",
          duration: 6000,
        });
        return;
      }
      if (
        error.data?.code === "UNAUTHORIZED" ||
        /gmail access expired|reconnect|401/i.test(error.message)
      ) {
        void utils.account.getAccounts.invalidate();
        void utils.account.getMyAccount.invalidate();
        if (isReconnectUiMuted()) return;
        toast.error("Reconnect Gmail", {
          description:
            "VectorMail is still signed in - only the Gmail link needs a quick refresh.",
          duration: 9000,
          action: {
            label: "Reconnect",
            onClick: () => window.location.assign("/api/connect/google"),
          },
        });
      }
    },
  });

  const getThreadsInput = useMemo(
    () => ({
      accountId: accountId ?? "placeholder",
      tab: currentTab,
      important,
      unread,
      limit: currentTab === "inbox" || currentTab === "label" ? 50 : 15,
      labelId: currentTab === "label" ? selectedLabelId ?? undefined : undefined,
    }),
    [accountId, currentTab, important, unread, selectedLabelId],
  );

  const softThreadListRefresh = useCallback(async () => {
    void utils.account.getNumThreads.invalidate();
    void utils.account.getUnifiedThreads.invalidate();
    await refetch();
  }, [utils, refetch]);

  const forceThreadListRefresh = useCallback(async () => {
    utils.account.getThreads.invalidate();
    utils.account.getNumThreads.invalidate();
    utils.account.getUnifiedThreads.invalidate();
    await refetch();
    router.refresh();
  }, [utils, refetch, router]);


  const syncEmailsMutation = api.account.syncEmails.useMutation({
    onSuccess: async (data) => {
      if (syncCancelledRef.current) {
        syncCancelledRef.current = false;
        lastContinueTokenRef.current = null;
        return;
      }
      if (data.needsReconnection || data.success === false) {
        console.warn("[ThreadList] Sync finished with issues", data);
      } else {
        console.log("[ThreadList] Sync completed", data);
      }

      if (data.needsReconnection) {
        autoContinueSyncCountRef.current = 0;
        void utils.account.getAccounts.invalidate();
        if (isReconnectUiMuted()) return;
        toast.error("Reconnect your account", {
          id: "reconnect-account-warning",
          description: "Your email connection expired and couldn’t be refreshed. Click Reconnect to sign in again.",
          duration: 10000,
          action: {
            label: "Reconnect",
            onClick: () => {
              window.location.assign("/api/connect/google");
            },
          },
        });
        return;
      }
      if (data.success === false) {
        autoContinueSyncCountRef.current = 0;
        toast.error("Sync failed. Try again.", { duration: 3000 });
        void forceThreadListRefresh();
        return;
      }

      if ("background" in data && data.background) {
        autoContinueSyncCountRef.current = 0;
        toast.info("Syncing in the background…", {
          description: "New mail will show up as it’s fetched. You can keep using the app.",
          duration: 5000,
        });
        void utils.account.getAccounts.invalidate();
        setRefreshingAfterSync(true);
        for (let i = 1; i <= 40; i++) {
          scheduleSafe(() => void softThreadListRefresh(), i * 2500);
        }
        scheduleSafe(() => setRefreshingAfterSync(false), 100_000);
        return;
      }

      const didFullSync = "syncAllFolders" in data && data.syncAllFolders === true;
      const hasMore = !didFullSync && "hasMore" in data && data.hasMore;
      const continueToken = "continueToken" in data ? data.continueToken : undefined;
      const willContinueSync =
        data.success &&
        hasMore &&
        continueToken &&
        accountId?.trim() &&
        accountId !== UNIFIED_INBOX_ACCOUNT_ID;

      if (willContinueSync) {
        if (lastContinueTokenRef.current === continueToken) {
          autoContinueSyncCountRef.current = 0;
          lastContinueTokenRef.current = null;
          console.warn("[ThreadList] Sync stopped — continueToken repeated.");
          setRefreshingAfterSync(true);
          scheduleSafe(() => void forceThreadListRefresh(), 1200);
          scheduleSafe(() => setRefreshingAfterSync(false), 2000);
          return;
        }

        if (autoContinueSyncCountRef.current >= MAX_AUTO_CONTINUE_SYNC_PAGES) {
          autoContinueSyncCountRef.current = 0;
          lastContinueTokenRef.current = null;
          toast.info("Paused inbox sync", {
            description:
              "Loaded a lot of mail in this session. Tap Sync again to keep going from where it left off.",
            duration: 6000,
          });
          setRefreshingAfterSync(true);
          scheduleSafe(() => void forceThreadListRefresh(), 1200);
          scheduleSafe(() => setRefreshingAfterSync(false), 2000);
          return;
        }
        lastContinueTokenRef.current = continueToken;
        autoContinueSyncCountRef.current += 1;
        void utils.account.getAccounts.invalidate();
        void utils.account.getNumThreads.invalidate();
        const folder = currentTab === "sent" ? "sent" : currentTab === "trash" ? "trash" : "inbox";
        scheduleSafe(() => {
          syncEmailsMutation.mutate({
            accountId: accountId.trim(),
            folder: folder as "inbox" | "sent" | "trash",
            continueToken,
          });
        }, 1200);
        return;
      }

      lastContinueTokenRef.current = null;

      autoContinueSyncCountRef.current = 0;
      void utils.account.getAccounts.invalidate();
      setRefreshingAfterSync(true);
      scheduleSafe(() => {
        void (async () => {
          await forceThreadListRefresh();
          if (wasUnmountedRef.current) return;
          setRefreshingAfterSync(false);
        })();
      }, 400);
      scheduleSafe(() => void forceThreadListRefresh(), 1200);

      if (data.success) {
        toast.success("Sync complete", {
          description: (data as { syncAllFolders?: boolean }).syncAllFolders
            ? "Inbox, Sent, and Trash synced."
            : (data.message ?? "Emails synced"),
          duration: 2000,
        });
      }
    },
    onError: (error) => {
      if (syncCancelledRef.current) {
        syncCancelledRef.current = false;
        autoContinueSyncCountRef.current = 0;
        lastContinueTokenRef.current = null;
        return;
      }

      const rawMessage = error.message || "";
      const cause = (error as { cause?: { name?: string } }).cause;
      const wasAborted =
        wasUnmountedRef.current ||
        cause?.name === "AbortError" ||
        /^unknown\s*error$/i.test(rawMessage) ||
        /the user aborted|aborted a request|signal is aborted/i.test(rawMessage);

      if (wasAborted) {
        autoContinueSyncCountRef.current = 0;
        lastContinueTokenRef.current = null;
        return;
      }

      console.error("[ThreadList] ❌ Sync failed:", error);

      const errorMessage =
        rawMessage.trim() && !/unknown\s*error/i.test(rawMessage)
          ? rawMessage
          : "Something went wrong. Check your connection and try again.";

      if (errorMessage.includes("Account not found") || errorMessage.includes("don't have access")) {
        void utils.account.getAccounts.invalidate();
        toast.error("Account session expired", {
          description: "Refreshing your account list. If you reconnected an account, it should appear shortly.",
          duration: 5000,
        });
        void forceThreadListRefresh();
        return;
      }
      if (
        errorMessage.includes("Account token is missing") ||
        errorMessage.includes("Account ID is required") ||
        errorMessage.includes("reconnect your account") ||
        errorMessage.includes("Please reconnect")
      ) {
        void utils.account.getAccounts.invalidate();
        if (isReconnectUiMuted()) return;
        toast.error("Sync failed", {
          description: "Your Gmail link needs to be refreshed. Reconnect - you stay signed in to VectorMail.",
          duration: 6000,
          action: {
            label: "Reconnect Gmail",
            onClick: () => window.location.assign("/api/connect/google"),
          },
        });
        void forceThreadListRefresh();
        return;
      }
      if (
        errorMessage.includes("timed out") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("Mail provider")
      ) {
        toast.info(errorMessage.includes("Mail provider") ? "Mail provider slow" : "Sync timed out", {
          description: errorMessage.includes("Mail provider")
            ? errorMessage
            : "The request took too long. Please try again in a moment.",
          duration: 5000,
        });
      } else if (
        errorMessage.includes("UNAUTHORIZED") ||
        errorMessage.includes("Authentication") ||
        errorMessage.toLowerCase().includes("sign in")
      ) {
        toast.error("Sync failed", {
          description: "Session couldn’t be verified. Refresh the page and try Sync again.",
          duration: 5000,
        });
      } else {
        toast.error("Sync failed", {
          description: errorMessage.length > 100 ? "An error occurred while syncing. Please try again." : errorMessage,
          duration: 4000,
        });
      }

      void forceThreadListRefresh();
      autoContinueSyncCountRef.current = 0;
    },
  });

  const syncEmailsPendingRef = useRef(false);
  syncEmailsPendingRef.current = syncEmailsMutation.isPending;

  const lastBackfillBridgeAtRef = useRef(0);
  const maybeTriggerBackfill = useCallback(() => {
    if (currentTab !== "inbox") return;
    if (backfillComplete) return;
    if (!accountId?.trim() || accountId === UNIFIED_INBOX_ACCOUNT_ID) return;
    if (syncEmailsPendingRef.current) return;
    const now = Date.now();
    if (now - lastBackfillBridgeAtRef.current < 12_000) return;
    lastBackfillBridgeAtRef.current = now;
    syncEmailsMutation.mutate({
      accountId: accountId.trim(),
      forceFullSync: false,
      syncAllFolders: false,
      folder: "inbox",
    });
  }, [currentTab, backfillComplete, accountId, syncEmailsMutation]);

  const invalidateAndClearSelection = useCallback(async () => {
    await utils.account.getThreads.invalidate();
    await utils.account.getUnifiedThreads.invalidate();
    await utils.account.getNumThreads.invalidate();
    setSelectedThreadIds(new Set());
  }, [utils]);

  const bulkMarkReadMutation = api.account.bulkMarkRead.useMutation({
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Marked as read");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to mark as read");
    },
  });

  const bulkMarkUnreadMutation = api.account.bulkMarkUnread.useMutation({
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Marked as unread");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to mark as unread");
    },
  });

  type GetThreadsPage = RouterOutputs["account"]["getThreads"];
  const bulkDeleteMutation = api.account.bulkDeleteThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t: RouterThread) => !input.threadIds.includes(t.id)),
        })) as GetThreadsPage[];
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (err, _input, context) => {
      setDeleteConfirmOpen(false);
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error(err.message ?? "Failed to delete", { id: "bulk-delete" });
    },
    onSuccess: async () => {
      setDeleteConfirmOpen(false);
      toast.success("Deleted", { id: "bulk-delete" });
      await invalidateAndClearSelection();
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
    },
  });

  const bulkArchiveMutation = api.account.bulkArchiveThreads.useMutation({
    onMutate: async (input) => {
      await utils.account.getThreads.cancel();
      const previousData = utils.account.getThreads.getInfiniteData(getThreadsInput) as
        | InfiniteData<GetThreadsPage>
        | undefined;
      if (previousData?.pages) {
        const newPages = previousData.pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t: RouterThread) => !input.threadIds.includes(t.id)),
        })) as GetThreadsPage[];
        utils.account.getThreads.setInfiniteData(getThreadsInput, (old) =>
          old ? { ...old, pages: newPages } : old,
        );
      }
      return { previousPages: previousData };
    },
    onError: (_err, _input, context) => {
      if (context?.previousPages !== undefined) {
        utils.account.getThreads.setInfiniteData(getThreadsInput, context.previousPages as never);
      }
      toast.error("Failed to archive");
    },
    onSuccess: async () => {
      await invalidateAndClearSelection();
      toast.success("Archived");
    },
    onSettled: () => {
      void utils.account.getThreads.invalidate();
      void utils.account.getUnifiedThreads.invalidate();
    },
  });

  const isBulkPending =
    bulkMarkReadMutation.isPending ||
    bulkMarkUnreadMutation.isPending ||
    bulkDeleteMutation.isPending ||
    bulkArchiveMutation.isPending;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const prefetchedNextPageRef = useRef(false);

  const handleRefresh = useCallback(() => {
    if (syncEmailsMutation.isPending) {
      syncCancelledRef.current = true;
      syncEmailsMutation.reset();
      toast.info("Sync stopped");
      return;
    }
    if (!accountId) {
      toast.error("Please wait for your account to load, then try Sync again.");
      return;
    }
    if (!accountId?.trim() || accountId === UNIFIED_INBOX_ACCOUNT_ID) {
      if (accountId === UNIFIED_INBOX_ACCOUNT_ID) {
        void utils.account.getUnifiedThreads.invalidate();
        void refetch();
      }
      return;
    }
    syncCancelledRef.current = false;
    autoContinueSyncCountRef.current = 0;
    const noThreadsYet = (threads?.length ?? 0) === 0;
    if (noThreadsYet && !syncFirstBatchQuickMutation.isPending) {
      toast.info("Fetching your first emails…", { duration: 2500 });
      syncFirstBatchQuickMutation.mutate({ accountId: accountId.trim() });
    } else {
      toast.info("Checking for new emails…");
    }

    syncEmailsMutation.mutate({
      accountId: accountId.trim(),
      forceFullSync: false,
      syncAllFolders: false,
      folder: "inbox",
    });
  }, [
    refetch,
    accountId,
    syncEmailsMutation,
    syncFirstBatchQuickMutation,
    threads?.length,
    utils.account.getUnifiedThreads,
  ]);

  useEffect(() => {
    prefetchedNextPageRef.current = false;
  }, [accountId, currentTab, selectedLabelId, isUnifiedView]);

  const isAccountValid = !!validatedAccount && validatedAccount.id === accountId;

  useEffect(() => {
    if (
      firstBatchTriggeredRef.current ||
      accountsLoading ||
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      isDemo ||
      !isAccountValid
    )
      return;

    const hasAnyThreads = (threads?.length ?? 0) > 0;
    if (hasAnyThreads) return;

    firstBatchTriggeredRef.current = true;
    toast.info("Fetching your latest emails…", {
      description: "Getting your first batch so your inbox appears quickly.",
      duration: 3500,
    });
    syncFirstBatchQuickMutation.mutate({ accountId: accountId.trim() });
  }, [
    accountId,
    accountsLoading,
    isAccountValid,
    isDemo,
    syncFirstBatchQuickMutation,
    threads?.length,
  ]);
  useEffect(() => {
    if (
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      !isAccountValid ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    if (!quickSyncTriggeredRef.current) {
      quickSyncTriggeredRef.current = true;
      autoContinueSyncCountRef.current = 0;
      syncEmailsMutation.mutate({
        accountId: accountId.trim(),
        forceFullSync: false,
        syncAllFolders: false,
        folder: currentTab as "inbox" | "sent" | "trash",
      });
    }
  }, [accountId, currentTab, syncEmailsMutation, isAccountValid]);

  useEffect(() => {
    if (
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      !isAccountValid ||
      backgroundSyncTriggeredRef.current ||
      (currentTab !== "inbox" && currentTab !== "sent")
    )
      return;
    backgroundSyncTriggeredRef.current = true;
    const aid = accountId.trim();
    const t = setTimeout(() => {
      if (syncEmailsPendingRef.current) return;
      syncEmailsMutation.mutate({
        accountId: aid,
        forceFullSync: false,
        syncAllFolders: false,
        folder: "inbox",
      });
    }, 8000);
    return () => clearTimeout(t);
  }, [accountId, currentTab, syncEmailsMutation, isAccountValid]);

  useEffect(() => {
    if (
      !accountId?.trim() ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      !isAccountValid ||
      (currentTab !== "inbox" && currentTab !== "sent" && currentTab !== "trash")
    ) {
      return;
    }
    const aid = accountId.trim();
    const folder = currentTab as "inbox" | "sent" | "trash";
    const tick = () => {
      if (wasUnmountedRef.current) return;
      if (syncEmailsPendingRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      syncEmailsMutation.mutate({
        accountId: aid,
        forceFullSync: false,
        syncAllFolders: false,
        folder,
      });
    };
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        tick();
      }
    };
    const interval = setInterval(tick, RECURRING_SYNC_INTERVAL_MS);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    return () => {
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [accountId, currentTab, isAccountValid, syncEmailsMutation]);

  useEffect(() => {
    onSyncPendingChange?.(syncEmailsMutation.isPending);
  }, [syncEmailsMutation.isPending, onSyncPendingChange]);

  useEffect(() => {
    if (
      !syncEmailsMutation.isPending ||
      !accountId ||
      accountId === UNIFIED_INBOX_ACCOUNT_ID ||
      (currentTab !== "inbox" && currentTab !== "sent" && currentTab !== "trash")
    )
      return;
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      if (count > MAX_REFRESHES_WHILE_SYNC) return;
      void softThreadListRefresh();
    }, SYNC_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [syncEmailsMutation.isPending, accountId, currentTab, forceThreadListRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccountConnection = useCallback(() => {
    window.location.href = "/api/connect/google";
  }, []);

  const lastThreadElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage || loadingMoreAtListEnd) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          if (hasNextPage) {
            setLoadingMoreAtListEnd(true);
            void fetchNextPage().finally(() => {
              setLoadingMoreAtListEnd(false);
            });
            return;
          }

          maybeTriggerBackfill();
        },
        {
          root: listContainerRef.current,
          rootMargin: "600px 0px",
          threshold: 0,
        },
      );
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, loadingMoreAtListEnd, hasNextPage, fetchNextPage, maybeTriggerBackfill],
  );

  useEffect(() => {
    if (!hasNextPage && loadingMoreAtListEnd) {
      setLoadingMoreAtListEnd(false);
    }
  }, [hasNextPage, loadingMoreAtListEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "x" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("[role='checkbox']")) return;
      if (threadId) {
        e.preventDefault();
        toggleSelection(threadId);
      }
    },
    [threadId, toggleSelection],
  );

  const threadsToRender = useMemo(
    () => (threads ?? []).filter((t) => (t.emails?.[0] ?? null) !== null),
    [threads],
  );

  useEffect(() => {
    if (prefetchedNextPageRef.current) return;
    if (isFetching || isFetchingNextPage || loadingMoreAtListEnd) return;
    if (!hasNextPage) return;
    if ((threadsToRender?.length ?? 0) < 50) return;
    if (currentTab !== "inbox" && currentTab !== "label") return;
    prefetchedNextPageRef.current = true;
    void fetchNextPage().catch(() => {
      prefetchedNextPageRef.current = false;
    });
  }, [
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    loadingMoreAtListEnd,
    threadsToRender?.length,
    currentTab,
    fetchNextPage,
  ]);

  const { data: inboxPreviewPayload, isFetching: inboxPreviewFetching } =
    api.account.getInboxPreview.useQuery(
      { accountId: accountId?.trim() ?? "", limit: 50 },
      {
        enabled:
          currentTab === "inbox" &&
          !isDemo &&
          isAccountValid &&
          !!accountId?.trim() &&
          accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
          (threads?.length ?? 0) === 0,
        staleTime: 15_000,
        retry: 1,
      },
    );

  const previewAuthFailed = Boolean(inboxPreviewPayload?.needsReconnection);
  const isWaitingForThreads =
    (threads?.length ?? 0) === 0 &&
    !previewAuthFailed &&
    (syncEmailsMutation.isPending || refreshingAfterSync || isFetching);
  useEffect(() => {
    if (!isWaitingForThreads) {
      setSlowLoad(false);
      if (slowLoadTimerRef.current) {
        clearTimeout(slowLoadTimerRef.current);
        slowLoadTimerRef.current = null;
      }
      return;
    }
    slowLoadTimerRef.current = setTimeout(() => {
      setSlowLoad(true);
      slowLoadTimerRef.current = null;
    }, 12_000);
    return () => {
      if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current);
    };
  }, [isWaitingForThreads]);

  const inboxPreviewReconnectToastRef = useRef(false);
  useEffect(() => {
    if (!inboxPreviewPayload?.needsReconnection) {
      inboxPreviewReconnectToastRef.current = false;
      return;
    }
    void utils.account.getAccounts.invalidate();
    if (isReconnectUiMuted()) return;
    if (inboxPreviewReconnectToastRef.current) return;
    inboxPreviewReconnectToastRef.current = true;
    toast.error("Reconnect your account", {
      id: "reconnect-account-warning",
      description:
        "Your email connection expired and couldn’t be refreshed. Click Reconnect to sign in again.",
      duration: 10000,
      action: {
        label: "Reconnect",
        onClick: () => {
          window.location.assign("/api/connect/google");
        },
      },
    });
  }, [inboxPreviewPayload?.needsReconnection, utils.account.getAccounts, isReconnectUiMuted]);

  const previewThreads = useMemo((): Thread[] => {
    const items = inboxPreviewPayload?.items ?? [];
    const uniqueByThreadId = new Map<string, (typeof items)[number]>();
    for (const row of items) {
      const id = row.threadId?.trim();
      if (!id || uniqueByThreadId.has(id)) continue;
      uniqueByThreadId.set(id, row);
    }
    return Array.from(uniqueByThreadId.values()).map((row) => ({
      id: row.threadId,
      subject: row.subject,
      lastMessageDate: new Date(row.sentAt),
      emails: [
        {
          from: { name: row.fromName },
          bodySnippet: row.snippet || null,
          sysLabels: row.unread ? ["unread"] : [],
          sysClassifications: row.classifications ?? [],
        },
      ],
    }));
  }, [inboxPreviewPayload?.items]);

  const hasPreviewRows = currentTab === "inbox" && previewThreads.length > 0;
  useEffect(() => {
    if (
      hasPreviewRows &&
      threadsToRender.length === 0 &&
      !previewAuthFailed
    ) {
      setPreviewStartedAtMs((prev) => prev ?? Date.now());
      return;
    }
    setPreviewStartedAtMs(null);
    previewRecoveryTriggeredRef.current = false;
  }, [hasPreviewRows, threadsToRender.length, previewAuthFailed]);

  useEffect(() => {
    if (!previewStartedAtMs) return;
    const t = setInterval(() => setPreviewNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [previewStartedAtMs]);

  const previewReadOnlyTimedOut = Boolean(
    previewStartedAtMs &&
    previewNowMs - previewStartedAtMs >= PREVIEW_READ_ONLY_MAX_MS,
  );

  const handleSearchResultSelect = useCallback(
    (id: string) => {
      setThreadId(id);
      onThreadSelect?.(id);
    },
    [setThreadId, onThreadSelect],
  );

  const { data: scheduledSends } = api.account.getScheduledSends.useQuery(
    { accountId: accountId || "placeholder" },
    {
      enabled:
        currentTab === "scheduled" &&
        !!accountId &&
        accountId.length > 0 &&
        !accountsLoading,
    },
  );
  const cancelScheduledMutation = api.account.cancelScheduledSend.useMutation({
    onSuccess: () => {
      void utils.account.getScheduledSends.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to cancel");
    },
  });

  const { data: nudgesData } = api.account.getNudges.useQuery(
    { accountId: accountId || "placeholder" },
    { enabled: !!accountId && accountId.length > 0 },
  );
  const focusChipsEnabled =
    currentTab === "inbox" &&
    !!accountId &&
    accountId !== UNIFIED_INBOX_ACCOUNT_ID;
  const { data: dailyBriefData } = api.account.getDailyBrief.useQuery(
    { accountId: accountId || "placeholder" },
    {
      enabled: focusChipsEnabled,
      staleTime: 60_000,
    },
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const focusCounts = useMemo(() => {
    const visibleIds = new Set((threadsToRender ?? []).map((t) => t.id));
    const importantIds = new Set(
      (dailyBriefData?.important ?? []).map((row) => row.threadId),
    );
    const lowPriorityIds = new Set(
      (dailyBriefData?.lowPriority ?? []).map((row) => row.threadId),
    );

    const inboxEmail = validatedAccount?.emailAddress;

    let needsReply = 0;
    let important = 0;
    let lowPriority = 0;
    for (const t of threadsToRender ?? []) {
      if (!visibleIds.has(t.id)) continue;
      const acct = accountLowerForThreadRow(
        t as Thread & { accountEmail?: string },
        isUnifiedView,
        inboxEmail,
      );
      if (threadMatchesNeedsReplyFocus(t, acct)) needsReply++;
      if (importantIds.has(t.id)) important++;
      if (lowPriorityIds.has(t.id)) lowPriority++;
    }

    return {
      all: visibleIds.size,
      needsReply,
      important,
      lowPriority,
    };
  }, [
    dailyBriefData,
    threadsToRender,
    validatedAccount?.emailAddress,
    isUnifiedView,
  ]);
  const isFocusActive = focusChipsEnabled && focusView !== "all";

  const cycleBriefFocus = useCallback(() => {
    if (!focusChipsEnabled) return;
    setFocusView((prev) => {
      const order: FocusView[] = [
        "all",
        "needsReply",
        "important",
        "lowPriority",
      ];
      const i = order.indexOf(prev);
      const next = ((i < 0 ? 0 : i) + 1) % order.length;
      const nextKey = order[next]!;
      queueMicrotask(() => {
        trackInboxBrainEvent("daily_brief_focus_changed", {
          filter_key: nextKey,
          source: "keyboard",
        });
      });
      return nextKey;
    });
  }, [focusChipsEnabled]);

  useImperativeHandle(
    ref,
    () => ({
      triggerSync: handleRefresh,
      cycleBriefFocus,
    }),
    [handleRefresh, cycleBriefFocus],
  );

  useEffect(() => {
    if (currentTab !== "inbox") {
      setFocusView("all");
    }
  }, [currentTab]);

  useEffect(() => {
    setFocusView("all");
  }, [accountId]);

  const nudgeTypeByThreadId = useMemo(() => {
    const map = new Map<string, "REMINDER" | "UNREPLIED">();
    for (const n of nudgesData?.nudges ?? []) {
      map.set(n.threadId, n.type);
    }
    return map;
  }, [nudgesData?.nudges]);

  const threadsForDisplay = useMemo(() => {
    if (threadsToRender.length > 0) {
      if (!isFocusActive) return threadsToRender;

      if (focusView === "needsReply") {
        const inboxEmail = validatedAccount?.emailAddress;
        return threadsToRender.filter((t) =>
          threadMatchesNeedsReplyFocus(
            t,
            accountLowerForThreadRow(
              t as Thread & { accountEmail?: string },
              isUnifiedView,
              inboxEmail,
            ),
          ),
        );
      }

      if (!dailyBriefData) return [];
      const ids = new Set(
        (dailyBriefData[focusView] ?? []).map((row) => row.threadId),
      );
      return threadsToRender.filter((t) => ids.has(t.id));
    }
    if (currentTab === "inbox" && previewThreads.length > 0) return previewThreads;
    return threadsToRender;
  }, [
    threadsToRender,
    previewThreads,
    currentTab,
    isFocusActive,
    focusView,
    dailyBriefData,
    validatedAccount?.emailAddress,
    isUnifiedView,
  ]);

  const isSyncActive =
    syncEmailsMutation.isPending || refreshingAfterSync || isFetching;

  useEffect(() => {
    if (currentTab !== "inbox" || hasNextPage || !isSyncActive) return;
    if (isFetching || isFetchingNextPage || loadingMoreAtListEnd) return;
    const t = setInterval(() => {
      void refetch();
    }, 8000);
    return () => clearInterval(t);
  }, [
    currentTab,
    hasNextPage,
    isSyncActive,
    isFetching,
    isFetchingNextPage,
    loadingMoreAtListEnd,
    refetch,
  ]);
  const isReadOnlyPreview = shouldKeepPreviewReadOnly({
    currentTab,
    hasDbThreads: threadsToRender.length > 0,
    hasPreviewThreads: previewThreads.length > 0,
    isSyncActive,
    previewStartedAtMs,
    nowMs: previewNowMs,
    maxReadOnlyMs: PREVIEW_READ_ONLY_MAX_MS,
  });

  useEffect(() => {
    if (!previewReadOnlyTimedOut || previewRecoveryTriggeredRef.current) return;
    previewRecoveryTriggeredRef.current = true;
    void forceThreadListRefresh();
    if (
      accountId?.trim() &&
      accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
      !syncEmailsMutation.isPending
    ) {
      syncEmailsMutation.mutate({
        accountId: accountId.trim(),
        forceFullSync: true,
        syncAllFolders: false,
        folder: "inbox",
      });
    }
    toast.warning("Sync taking longer than expected", {
      description:
        "Preview is unlocked now while we keep retrying inbox sync in the background.",
      duration: 4500,
    });
  }, [
    previewReadOnlyTimedOut,
    forceThreadListRefresh,
    accountId,
    syncEmailsMutation,
  ]);

  const groupedThreads = useMemo(() => {
    if (!threadsForDisplay || threadsForDisplay.length === 0) return {};
    return threadsForDisplay.reduce((acc: GroupedThreads, thread: Thread) => {
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(thread);
      return acc;
    }, {});
  }, [threadsForDisplay]);

  const allThreads = threadsForDisplay ?? [];
  const lastThreadId = allThreads[allThreads.length - 1]?.id;

  if (accountsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#ffffff]">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#1e2a4a] dark:border-[#ffffff] dark:border-t-[#1e2a4a]" />
          <p className="mt-3 text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentTab === "scheduled") {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-[#ffffff]">
        <div className="flex-shrink-0 border-b border-[#e5e7eb] px-4 py-3 dark:border-[#ffffff]">
          <h2 className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">Scheduled sends</h2>
          <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">Emails that will be sent at the chosen time</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!scheduledSends || scheduledSends.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <CalendarClock className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No scheduled sends
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Schedule an email from Compose, Reply, or Forward
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#dadce0] dark:divide-[#3c4043]">
              {scheduledSends.map((item: { id: string; subject: string; scheduledAt: Date }) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8f9fa] dark:hover:bg-[#292a2d]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#202124] dark:text-[#e8eaed]">{item.subject}</p>
                    <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{format(item.scheduledAt, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-[#d93025] hover:bg-[#fce8e6] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
                    onClick={() => cancelScheduledMutation.mutate({ id: item.id })}
                    disabled={cancelScheduledMutation.isPending}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (!accountId || (accounts !== undefined && accounts.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center bg-white p-10 dark:bg-[#ffffff]">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]">
            <Mail className="h-8 w-8 text-[#5f6368] dark:text-[#9aa0a6]" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-[#202124] dark:text-[#e8eaed]">{CONNECTION_ERROR_MESSAGES.NO_ACCOUNT}</h2>
          <p className="mb-6 text-[14px] leading-relaxed text-[#5f6368] dark:text-[#9aa0a6]">{CONNECTION_ERROR_MESSAGES.CONNECT_DESCRIPTION}</p>
          <button
            onClick={handleAccountConnection}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1765cc] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {CONNECTION_ERROR_MESSAGES.CONNECT_BUTTON}
          </button>
        </div>
      </div>
    );
  }

  const renderThreadItem = (thread: Thread, isLast: boolean, readOnlyPreview = false) => {
    const latestEmail = thread.emails?.[0] ?? null;
    const fromAddress = latestEmail?.from?.address ?? null;
    const fromName =
      latestEmail?.from?.name?.trim() || fromAddress || "Unknown";
    const subject = thread.subject || "(No subject)";
    const date = thread.lastMessageDate ?? new Date();
    const bodySnippet = latestEmail?.bodySnippet ?? null;
    const sysLabels = latestEmail?.sysLabels ?? [];
    const sysClassifications = latestEmail?.sysClassifications ?? [];
    const isUnread = sysLabels.includes("unread");
    const isImportant = sysLabels.includes("important");
    const isSelected = threadId === thread.id;
    const isRowSelected = selectedThreadIds.has(thread.id);
    const categoryBadges = sysClassifications
      .filter((c): c is string => Boolean(c) && c !== "personal")
      .slice(0, 2)
      .map((c) => CATEGORY_BADGE[c.toLowerCase()])
      .filter(
        (b): b is { label: string; className: string } => Boolean(b),
      );
    const threadLabels = (thread as RouterThread & { threadLabels?: Array<{ label: { id: string; name: string; color: string | null } }> }).threadLabels?.map((tl: { label: { id: string; name: string; color: string | null } }) => tl.label) ?? [];

    const showSnooze =
      (effectiveAccountId ?? accountId) &&
      (currentTab === "inbox" || currentTab === "snoozed");
    const showRemind =
      (effectiveAccountId ?? accountId) &&
      (currentTab === "inbox" ||
        currentTab === "snoozed" ||
        currentTab === "reminders");
    const showRowActions =
      !readOnlyPreview &&
      (showSnooze || showRemind) &&
      (isSelected || isRowSelected);
    const nudgeType = nudgeTypeByThreadId.get(thread.id);
    const threadAccountId = (thread as { accountId?: string }).accountId ?? accountId ?? "";
    const accountLabel = isUnifiedView && "accountEmail" in thread ? String((thread as { accountEmail?: string; accountName?: string }).accountEmail ?? (thread as { accountEmail?: string; accountName?: string }).accountName ?? "") : "";
    const hasUrgentTag = categoryBadges.some((badge) => badge.className.includes("t-urgent"));
    const hasReplyTag = categoryBadges.some((badge) => badge.className.includes("t-reply"));
    const hasPromoTag = categoryBadges.some((badge) => badge.className.includes("t-promo"));
    const rowCategory = hasUrgentTag
      ? "urgent"
      : hasReplyTag
        ? "needs-reply"
        : hasPromoTag
          ? "promotions"
          : "updates";
    const openThread = () => {
      if (readOnlyPreview) {
        toast.info("Still syncing your inbox", {
          description:
            "You can open threads once your mail has finished syncing to VectorMail.",
          duration: 4000,
        });
        return;
      }
      setThreadId(thread.id);
      onThreadSelect?.(thread.id);
    };

    return (
      <div
        key={thread.id}
        ref={isLast ? lastThreadElementRef : null}
        data-cat={rowCategory}
        role="button"
        tabIndex={readOnlyPreview ? -1 : 0}
        className={cn("email-row", isSelected && "active", isUnread && "unread")}
        onClick={openThread}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openThread();
          }
        }}
      >
        <div
          style={{ display: "none" }}
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <Checkbox
            checked={isRowSelected}
            onCheckedChange={() => toggleSelection(thread.id)}
            aria-label={`Select ${subject}`}
            className="border-[#9ca3af] dark:border-[#71717a] data-[state=checked]:bg-[#1e2a4a] data-[state=checked]:border-[#1e2a4a] dark:data-[state=checked]:bg-[#1e2a4a] dark:data-[state=checked]:border-[#1e2a4a]"
          />
        </div>

        <SenderAvatar
          fromName={fromName}
          fromAddress={fromAddress}
          isUnread={isUnread}
        />

        <div className="email-row-content">
          <div className="email-row-head">
            <span className="email-from">{fromName}</span>
            <span className="email-time">
              {formatDistanceToNow(date, { addSuffix: false })}
            </span>
          </div>

          <div className="email-row-subject-line">
            <span className="email-subject">{subject}</span>
            {(accountLabel ||
              categoryBadges.length > 0 ||
              threadLabels.length > 0 ||
              followUpBadgeByThreadId[thread.id]) && (
                <span className="email-row-tags">
                  {accountLabel && <span>{accountLabel}</span>}
                  {categoryBadges.map((badge) => (
                    <span key={badge.label} className={badge.className}>
                      {badge.label}
                    </span>
                  ))}
                  {threadLabels
                    .slice(0, 3)
                    .map(
                      (lbl: { id: string; name: string; color: string | null }) => (
                        <span
                          key={lbl.id}
                          className="tag t-update"
                          style={
                            lbl.color
                              ? {
                                backgroundColor: `${lbl.color}20`,
                                color: lbl.color,
                              }
                              : undefined
                          }
                        >
                          {lbl.name}
                        </span>
                      ),
                    )}
                  {followUpBadgeByThreadId[thread.id] && (
                    <span
                      className="tag t-urgent"
                      title={
                        followUpBadgeByThreadId[thread.id]?.wasRealSend
                          ? "Auto follow-up sent (delivered)"
                          : "Auto follow-up completed (simulated)"
                      }
                    >
                      Auto
                    </span>
                  )}
                </span>
              )}
          </div>

          {bodySnippet && <div className="email-snippet">{bodySnippet}</div>}
        </div>

        <span style={{ display: "none" }}>
          {nudgeType === "REMINDER" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Bell className="h-3 w-3 text-[#b36b00] dark:text-[#ffffff]" />
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-[#303134] text-xs text-[#e8eaed]"
              >
                Reminder
              </TooltipContent>
            </Tooltip>
          )}
          {isImportant && (
            <Star className="h-3 w-3 fill-[#1e2a4a] text-[#1e2a4a] dark:fill-[#1e2a4a] dark:text-[#1e2a4a]" />
          )}
        </span>

        {showRowActions && (
          <div
            style={{ display: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {showSnooze && (
              <SnoozeMenu
                threadId={thread.id}
                accountId={threadAccountId}
                isSnoozedTab={currentTab === "snoozed"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                  aria-label="Snooze"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SnoozeMenu>
            )}
            {showRemind && (
              <RemindMenu
                threadId={thread.id}
                accountId={threadAccountId}
                isRemindersTab={currentTab === "reminders"}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
                  aria-label="Remind me if no reply"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </RemindMenu>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderThreadsList = () => {
    const noThreads = threadsForDisplay.length === 0;
    const hasPreviewRows = currentTab === "inbox" && previewThreads.length > 0 && threadsForDisplay.length === 0;
    const isInboxSentOrTrash =
      currentTab === "inbox" || currentTab === "sent" || currentTab === "trash";
    const isSyncPending = isInboxSentOrTrash && syncEmailsMutation.isPending;

    if (
      noThreads &&
      (isSyncPending || refreshingAfterSync || isFetching) &&
      !hasPreviewRows
    ) {
      if (slowLoad) {
        return (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#5f6368] dark:text-[#9aa0a6]" />
            <div>
              <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                Taking longer than usual
              </p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                The server may be busy. Try refreshing the list.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
              onClick={() => {
                setSlowLoad(false);
                void forceThreadListRefresh();
              }}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Refresh list
            </Button>
          </div>
        );
      }
      return <ThreadListSkeleton />;
    }

    if (isFocusActive && noThreads && !isFetching) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
            No threads in this focus view yet
          </p>
          <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
            Try another bucket or switch back to all threads.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
            onClick={() => {
              trackInboxBrainEvent("daily_brief_focus_changed", {
                filter_key: "all",
                source: "chip",
              });
              setFocusView("all");
            }}
          >
            Back to All
          </Button>
        </div>
      );
    }

    if (Object.keys(groupedThreads).length === 0 && !isFetching) {
      const waitingInboxPreview =
        currentTab === "inbox" &&
        threadsForDisplay.length === 0 &&
        inboxPreviewFetching &&
        !inboxPreviewPayload?.needsReconnection;
      if (waitingInboxPreview) {
        return <ThreadListSkeleton />;
      }
      const isRemindersTab = currentTab === "reminders";
      const matchedAccount = accounts?.find((a) => a.id === accountId);
      const currentAccountNeedsReconnection = Boolean(
        isInboxSentOrTrash &&
        accountId &&
        accountId !== UNIFIED_INBOX_ACCOUNT_ID &&
        (inboxPreviewPayload?.needsReconnection === true ||
          (matchedAccount &&
            "needsReconnection" in matchedAccount &&
            matchedAccount.needsReconnection)),
      );
      if (currentAccountNeedsReconnection && !isReconnectUiMuted()) {
        return (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <Mail className="mb-4 h-10 w-10 text-[#d93025] dark:text-[#f28b82]" />
            <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
              Reconnect your account
            </p>
            <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              Your email connection expired and couldn’t be refreshed. Reconnect to sync again.
            </p>
            <a
              href="/api/connect/google"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#1a73e8] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1765cc] dark:bg-[#1e2a4a] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
            >
              Reconnect account
            </a>
          </div>
        );
      }
      const syncFailed =
        isInboxSentOrTrash && threadsToRender.length === 0 && syncEmailsMutation.isError;
      if (syncFailed) {
        return (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <Mail className="mb-4 h-10 w-10 text-[#d93025] dark:text-[#f28b82]" />
            <p className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">Sync failed</p>
            <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              {syncEmailsMutation.error?.message?.toLowerCase().includes("sign in") ||
                syncEmailsMutation.error?.message?.toLowerCase().includes("unauthorized")
                ? "Session couldn't be verified. Refresh the page and try Sync again."
                : syncEmailsMutation.error?.message ?? "Something went wrong. Check your connection and try again."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </Button>
              {accountId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                  onClick={() => {
                    if (accountId?.trim()) {
                      syncEmailsMutation.mutate({
                        accountId: accountId.trim(),
                        forceFullSync: true,
                        syncAllFolders: true,
                      });
                    }
                  }}
                  disabled={syncEmailsMutation.isPending}
                >
                  {syncEmailsMutation.isPending ? "Syncing…" : "Sync again"}
                </Button>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
          {isRemindersTab ? (
            <>
              <Bell className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No reminders due</p>
              <p className="mt-1 max-w-sm text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                {syncEmailsMutation.error?.message?.toLowerCase().includes("sign in") ||
                  syncEmailsMutation.error?.message?.toLowerCase().includes("unauthorized")
                  ? "Session couldn’t be verified. Refresh the page and try Sync again."
                  : syncEmailsMutation.error?.message ?? "Something went wrong. Check your connection and try again."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                  onClick={() => window.location.reload()}
                >
                  Refresh page
                </Button>
                {accountId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#303134]"
                    onClick={() => {
                      if (accountId.trim()) {
                        syncEmailsMutation.mutate({
                          accountId: accountId.trim(),
                          forceFullSync: true,
                          syncAllFolders: true,
                        });
                      }
                    }}
                    disabled={syncEmailsMutation.isPending}
                  >
                    {syncEmailsMutation.isPending ? "Syncing…" : "Sync again"}
                  </Button>
                )}
              </div>
            </>
          ) : isRemindersTab ? (
            <>
              <Bell className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No reminders due</p>
            </>
          ) : currentTab === "trash" ? (
            <>
              <Trash2 className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No emails in trash</p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                Use <strong>Sync</strong> at the top to sync Inbox, Sent, and Trash together.
              </p>
            </>
          ) : (
            <>
              <Mail className="mb-4 h-10 w-10 text-[#9aa0a6] dark:text-[#5f6368]" />
              <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6]">No emails found</p>
              <p className="mt-1 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
                Use <strong>Sync</strong> at the top to sync Inbox, Sent, and Trash together.
              </p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {currentTab === "inbox" && !isReadOnlyPreview && Object.keys(groupedThreads).length > 0 && (
          <header className="date-header">
            <div className="date-eyebrow">THE DAILY RITUAL</div>
            <h1 className="date-title">
              {format(new Date(), "EEEE")},{" "}
              <span className="it">{format(new Date(), "MMMM d")}</span>
            </h1>
            <div className="date-stats">
              {(() => {
                const allThreads = Object.values(groupedThreads).flat();
                const unread = allThreads.filter((t) =>
                  (t.emails ?? []).some((e) =>
                    (e.sysLabels ?? []).includes("unread"),
                  ),
                ).length;
                const total = allThreads.length;
                return (
                  <>
                    <span>
                      <span className="num">{unread}</span> unread
                    </span>
                    <span className="sep" aria-hidden />
                    <span>
                      <span className="num">{total}</span> in queue
                    </span>
                    <span className="sep" aria-hidden />
                    <span className="live">synced just now</span>
                  </>
                );
              })()}
            </div>
          </header>
        )}
        {isReadOnlyPreview && (
          <div className="border-b border-[#1f2937] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] px-4 py-3 shadow-[inset_0_1px_0_rgba(148,163,184,0.12)]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#1e2a4a] shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-wide text-[#f3e8c8]">
                  Live inbox preview
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#e8d59f]/90">
                  Showing your latest mail from the provider while we sync into VectorMail. Rows are read only until sync finishes, then you can open threads and use all actions.
                </p>
              </div>
            </div>
          </div>
        )}
        {currentTab === "inbox" && !isReadOnlyPreview && hasPreviewRows && (
          <div className="border-b border-text-[#1e2a4a] bg-text-[#1e2a4a] px-4 py-2.5 dark:border-text-[#1e2a4a] dark:bg-text-[#1e2a4a]">
            <p className="text-[11px] text-text-[#1e2a4a] dark:text-text-[#1e2a4a]">
              Sync is taking longer than expected. Threads are unlocked now, and inbox sync will keep retrying in the background.
            </p>
          </div>
        )}
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="day-divider">
              <span>
                {format(new Date(date), "EEEE, MMMM d")}
              </span>
              <span className="day-count">
                · {threads.length} {threads.length === 1 ? "msg" : "msgs"}
              </span>
            </div>
            {threads.map((thread) =>
              renderThreadItem(thread, thread.id === lastThreadId, isReadOnlyPreview),
            )}
          </React.Fragment>
        ))}
        {(isFetchingNextPage || loadingMoreAtListEnd) && (
          <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#1e2a4a] dark:border-[#ffffff] dark:border-t-[#1e2a4a]" />
            <span>Loading more emails…</span>
          </div>
        )}
        {!hasNextPage &&
          !isFetchingNextPage &&
          !loadingMoreAtListEnd &&
          allThreads.length >= 50 &&
          (isSyncActive || (currentTab === "inbox" && !backfillComplete) ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#1e2a4a] dark:border-[#ffffff] dark:border-t-[#1e2a4a]" />
              <span>Syncing older emails…</span>
            </div>
          ) : (
            <div className="py-6 text-center text-[11px] tracking-wide text-[#9aa0a6] dark:text-[#5f6368]">
              You&apos;re all caught up
            </div>
          ))}
      </div>
    );
  };

  const selectedCount = selectedThreadIds.size;
  const showBulkBar = selectedCount > 0 && !isSearching;
  const showArchiveAndDelete =
    currentTab === "inbox" ||
    currentTab === "snoozed" ||
    currentTab === "archive";

  const handleBulkDelete = async () => {
    if (isUnifiedView && threads?.length) {
      const byAccount = new Map<string, string[]>();
      for (const id of selectedThreadIds) {
        const t = threads.find((x) => x.id === id);
        const aid = t && "accountId" in t ? t.accountId : undefined;
        if (aid) {
          const arr = byAccount.get(aid) ?? [];
          arr.push(id);
          byAccount.set(aid, arr);
        }
      }
      toast.loading("Deleting…", { id: "bulk-delete" });
      try {
        for (const [aid, ids] of byAccount) {
          await bulkDeleteMutation.mutateAsync({ accountId: aid, threadIds: ids });
        }
        setDeleteConfirmOpen(false);
        toast.success("Deleted", { id: "bulk-delete" });
        await invalidateAndClearSelection();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete", { id: "bulk-delete" });
      }
      return;
    }
    if (!accountId || accountId === UNIFIED_INBOX_ACCOUNT_ID) return;
    toast.loading("Deleting…", { id: "bulk-delete" });
    bulkDeleteMutation.mutate({
      accountId,
      threadIds: Array.from(selectedThreadIds),
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#ffffff]">
      {showBulkBar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 dark:border-[#ffffff] dark:bg-[#18181b]">
          <span className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
            {selectedCount} selected
          </span>
          <div className="flex flex-wrap items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={() =>
                accountId &&
                bulkMarkReadMutation.mutate({
                  accountId,
                  threadIds: Array.from(selectedThreadIds),
                })
              }
            >
              <MailOpen className="h-3.5 w-3.5" />
              Mark read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={() =>
                accountId &&
                bulkMarkUnreadMutation.mutate({
                  accountId,
                  threadIds: Array.from(selectedThreadIds),
                })
              }
            >
              <Mail className="h-3.5 w-3.5" />
              Mark unread
            </Button>
            {showArchiveAndDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-[12px] text-[#d93025] hover:bg-[#fce8e6] hover:text-[#d93025] dark:text-[#f28b82] dark:hover:bg-[#5f2120]"
                      disabled={isBulkPending || isDemo}
                      onClick={() => (isDemo ? toast.info("You're exploring with sample data. Request access to connect your Gmail.") : setDeleteConfirmOpen(true))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#303134] text-xs text-[#e8eaed]">
                  {isDemo ? "Request access to use this" : "Delete selected"}
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
              disabled={isBulkPending}
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount} conversation{selectedCount !== 1 ? "s" : ""} will be deleted and removed from your inbox. You can restore them from Trash later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        ref={listContainerRef}
        tabIndex={0}
        role="listbox"
        aria-label="Thread list"
        className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none"
        onKeyDown={handleKeyDown}
      >
        {isSearching && searchValue ? (
          <SearchResults onResultSelect={handleSearchResultSelect} />
        ) : (
          renderThreadsList()
        )}
      </div>
    </div>
  );
});
