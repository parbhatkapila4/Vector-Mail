"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const showDetails = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4 py-8 dark:bg-[#202124]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-xl dark:border-[#3c4043] dark:bg-[#292a2d]">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1a73e8] via-[#8ab4f8] to-[#1a73e8] dark:from-[#174ea6] dark:via-[#8ab4f8] dark:to-[#174ea6]" />

        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fce8e6] dark:bg-[#5f2120]/60">
              <AlertTriangle className="h-8 w-8 text-[#d93025] dark:text-[#f28b82]" strokeWidth={2} />
            </div>

            <h1 className="mb-2 text-xl font-semibold tracking-tight text-[#202124] dark:text-[#e8eaed] sm:text-2xl">
              Something went wrong
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-[#5f6368] dark:text-[#9aa0a6]">
              We ran into an unexpected error. Try again or head back home.
            </p>
          </div>

          {showDetails && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg border border-[#dadce0] bg-[#f8f9fa] px-4 py-3 text-left text-sm font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:bg-[#35363a] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
              >
                <span>Error details</span>
                {detailsOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </button>
              {detailsOpen && (
                <div className="mt-2 max-h-52 overflow-auto rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-4 dark:border-[#3c4043] dark:bg-[#202124]">
                  <p className="break-all font-mono text-xs leading-relaxed text-[#d93025] dark:text-[#f28b82]">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              Try again
            </button>
            <Link href="/" className="block sm:inline-block">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#dadce0] bg-white px-5 py-3 text-sm font-medium text-[#202124] transition-colors hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:bg-[#35363a] dark:text-[#e8eaed] dark:hover:bg-[#3c4043] sm:w-auto"
              >
                <Home className="h-4 w-4 shrink-0" />
                Go home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
