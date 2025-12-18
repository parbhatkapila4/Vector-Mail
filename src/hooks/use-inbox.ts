import { useState, useEffect, useCallback } from "react";

export interface InboxEmail {
  id: string;
  from: {
    name: string | null;
    address: string;
  };
  subject: string;
  date: string;
  snippet: string;
}

interface UseInboxResult {
  emails: InboxEmail[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInbox(): UseInboxResult {
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchInbox = useCallback(
    async (pageToken?: string, append: boolean = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          maxResults: "50",
        });

        if (pageToken) {
          params.set("pageToken", pageToken);
        }

        const response = await fetch(`/api/inbox?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch inbox: ${response.status}`);
        }

        const data = await response.json();

        if (append) {
          setEmails((prev) => [...prev, ...(data.messages ?? [])]);
        } else {
          setEmails(data.messages ?? []);
        }

        setNextPageToken(data.nextPageToken);
        setHasMore(!!data.nextPageToken);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        console.error("[useInbox] Error:", error);
        setFetchAttempted(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchMore = useCallback(async () => {
    if (nextPageToken && !isLoading) {
      await fetchInbox(nextPageToken, true);
    }
  }, [nextPageToken, isLoading, fetchInbox]);

  const refetch = useCallback(async () => {
    await fetchInbox(undefined, false);
  }, [fetchInbox]);

  useEffect(() => {
    if (!fetchAttempted) {
      setFetchAttempted(true);
      void fetchInbox(undefined, false);
    }
  }, [fetchAttempted, fetchInbox]);

  return {
    emails,
    isLoading,
    error,
    hasMore,
    fetchMore,
    refetch,
  };
}
