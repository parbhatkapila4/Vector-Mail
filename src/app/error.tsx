"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-yellow-900/20 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Something went wrong!
        </h1>

        <p className="mb-6 text-gray-400">
          We encountered an unexpected error. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="mb-2 cursor-pointer text-purple-400 hover:text-purple-300">
              Error Details (Development Only)
            </summary>
            <div className="max-h-48 overflow-auto rounded-lg bg-black/50 p-4">
              <p className="break-all font-mono text-sm text-red-400">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link href="/">
            <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20">
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
