"use client";

export function ThreadListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex w-full items-start gap-3 border-b border-[#f3f4f6] px-2 py-2.5 pr-2 dark:border-[#1a1a23]"
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-[78%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
            <div className="h-3 w-[65%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
            <div className="h-3 w-[45%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
          </div>
        </div>
      ))}
    </div>
  );
}
