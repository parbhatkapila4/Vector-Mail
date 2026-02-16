"use client";

export function ThreadViewSkeleton() {
  return (
    <div className="flex h-full flex-col bg-[#fafafa] p-6 dark:bg-[#0a0a0a]">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-800" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3.5 w-32 rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
          <div className="h-3 w-24 rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
        </div>
      </div>
      <div className="mb-6 h-5 w-[85%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
      <div className="flex flex-col gap-3">
        <div className="h-3 w-full rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
        <div className="h-3 w-[80%] rounded bg-neutral-100 animate-pulse dark:bg-neutral-800/80" />
        <div className="h-3 w-[60%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
        <div className="h-3 w-[90%] rounded bg-neutral-100 animate-pulse dark:bg-neutral-800/80" />
        <div className="h-3 w-[70%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
        <div className="h-3 w-[50%] rounded bg-neutral-100 animate-pulse dark:bg-neutral-800/80" />
        <div className="h-3 w-[75%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
      </div>
    </div>
  );
}
