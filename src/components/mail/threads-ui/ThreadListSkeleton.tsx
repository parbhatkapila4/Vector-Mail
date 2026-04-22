"use client";

import { useEffect, useRef, useState } from "react";

const ROW_HEIGHT_PX = 72;
const MIN_ROWS = 10;
const MAX_ROWS = 40;

export function ThreadListSkeleton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowCount, setRowCount] = useState<number>(MIN_ROWS);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const height = el.clientHeight || el.parentElement?.clientHeight || 0;
      if (!height) return;
      const estimated = Math.ceil(height / ROW_HEIGHT_PX) + 2;
      setRowCount(Math.max(MIN_ROWS, Math.min(MAX_ROWS, estimated)));
    };

    compute();

    const observer = new ResizeObserver(compute);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-full w-full flex-col"
      aria-busy="true"
      aria-label="Loading threads"
    >
      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  const primaryWidth = 70 + ((index * 7) % 25);
  const secondaryWidth = 55 + ((index * 11) % 30);
  const tertiaryWidth = 35 + ((index * 13) % 30);

  return (
    <div className="flex w-full items-start gap-3 border-b border-[#f3f4f6] px-3 py-3 dark:border-[#1a1a23]">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#e5e7eb] dark:bg-[#1f1f24]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <div
            className="h-3.5 animate-pulse rounded bg-[#e5e7eb] dark:bg-[#1f1f24]"
            style={{ width: `${primaryWidth}%` }}
          />
          <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[#e5e7eb] dark:bg-[#1f1f24]" />
        </div>
        <div
          className="h-3 animate-pulse rounded bg-[#e5e7eb] dark:bg-[#1f1f24]"
          style={{ width: `${secondaryWidth}%` }}
        />
        <div
          className="h-2.5 animate-pulse rounded bg-[#e5e7eb] dark:bg-[#1f1f24]"
          style={{ width: `${tertiaryWidth}%` }}
        />
      </div>
    </div>
  );
}
