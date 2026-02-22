"use client";

export function ThreadViewSkeleton() {
  return (
    <div className="flex h-full flex-col bg-white p-6 dark:bg-[#202124]">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-11 w-11 shrink-0 rounded-full bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3.5 w-32 rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
          <div className="h-3 w-24 rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
        </div>
      </div>
      <div className="mb-6 h-5 w-[85%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
      <div className="flex flex-col gap-3">
        <div className="h-3 w-full rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
        <div className="h-3 w-[80%] rounded bg-[#f1f3f4] animate-pulse dark:bg-[#3c4043]/80" />
        <div className="h-3 w-[60%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
        <div className="h-3 w-[90%] rounded bg-[#f1f3f4] animate-pulse dark:bg-[#3c4043]/80" />
        <div className="h-3 w-[70%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
        <div className="h-3 w-[50%] rounded bg-[#f1f3f4] animate-pulse dark:bg-[#3c4043]/80" />
        <div className="h-3 w-[75%] rounded bg-[#e8eaed] animate-pulse dark:bg-[#3c4043]" />
      </div>
    </div>
  );
}
