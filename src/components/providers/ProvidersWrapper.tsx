"use client";

import dynamic from "next/dynamic";

const AppProviders = dynamic(() => import("./AppProviders"), {
  ssr: true,
  loading: () => (
    <div
      className="min-h-screen w-full bg-white dark:bg-black"
      aria-label="Loading…"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-yellow-500 dark:border-neutral-700 dark:border-t-yellow-400" />
      </div>
    </div>
  ),
},
);

export function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProviders>{children}</AppProviders>;
}
