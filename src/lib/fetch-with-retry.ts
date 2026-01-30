const DEFAULT_REQUEST_TIMEOUT_MS = 90_000;

export async function fetchWithAuthRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  requestTimeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  let lastError: Error | null = null;
  const timeoutIdRef: { current: ReturnType<typeof setTimeout> | null } = {
    current: null,
  };
  const controller =
    options.signal && "abort" in options.signal
      ? null
      : new AbortController();
  const signal = (options.signal ?? controller?.signal) as AbortSignal;

  if (controller && requestTimeoutMs > 0) {
    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
    }, requestTimeoutMs);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }

      const response = await fetch(url, {
        ...options,
        signal,
        credentials: "include",
      });

      if (response.ok || response.status !== 401) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        return response;
      }

      if (response.status === 401 && attempt < maxRetries) {
        const authReason = response.headers.get("X-Clerk-Auth-Reason");
        const authStatus = response.headers.get("X-Clerk-Auth-Status");

        if (
          authReason?.includes("token-expired") ||
          authStatus === "signed-out"
        ) {
          try {
            await fetch("/api/inbox", {
              method: "GET",
              credentials: "include",
            });
          } catch (refreshError) {
            console.warn(
              `[fetchWithAuthRetry] Session refresh attempt ${attempt + 1} failed:`,
              refreshError,
            );
          }

          await new Promise((resolve) => {
            const timeoutId = setTimeout(resolve, 300 * (attempt + 1));
            if (signal) {
              signal.addEventListener("abort", () => {
                clearTimeout(timeoutId);
                resolve(undefined);
              });
            }
          });

          if (signal?.aborted) {
            throw new DOMException("The operation was aborted.", "AbortError");
          }

          continue;
        }
      }

      return response;
    } catch (error) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const retrySignal = options.signal as AbortSignal | undefined;
        if (signal?.aborted) {
          throw new DOMException("The operation was aborted.", "AbortError");
        }

        await new Promise((resolve) => {
          const timeoutId = setTimeout(resolve, 300 * (attempt + 1));
          if (retrySignal) {
            retrySignal.addEventListener("abort", () => {
              clearTimeout(timeoutId);
              resolve(undefined);
            });
          }
        });

        if (signal?.aborted) {
          throw new DOMException("The operation was aborted.", "AbortError");
        }

        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Failed to fetch with retry");
}
