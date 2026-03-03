"use client";

export function ThreadViewSkeleton() {
  return (
    <div className="flex h-full flex-col bg-white p-6 dark:bg-[#111113]">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-11 w-11 shrink-0 rounded-full bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3.5 w-32 rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
          <div className="h-3 w-24 rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
        </div>
      </div>
      <div className="mb-6 h-5 w-[85%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
      <div className="flex flex-col gap-3">
        <div className="h-3 w-full rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
        <div className="h-3 w-[80%] rounded bg-[#f3f4f6] animate-pulse dark:bg-[#18181b]/80" />
        <div className="h-3 w-[60%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
        <div className="h-3 w-[90%] rounded bg-[#f3f4f6] animate-pulse dark:bg-[#18181b]/80" />
        <div className="h-3 w-[70%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
        <div className="h-3 w-[50%] rounded bg-[#f3f4f6] animate-pulse dark:bg-[#18181b]/80" />
        <div className="h-3 w-[75%] rounded bg-[#e5e7eb] animate-pulse dark:bg-[#18181b]" />
      </div>
    </div>
  );
}
