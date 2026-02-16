"use client";

export function ThreadListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex w-full items-start gap-4 border-b border-neutral-100 px-2 py-3.5 pr-5 dark:border-neutral-900"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-800" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-[78%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
            <div className="h-3 w-[65%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
            <div className="h-3 w-[45%] rounded bg-neutral-200 animate-pulse dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
