"use client";

import { useEffect, useRef, useState } from "react";

const ROW_HEIGHT_PX = 88;
const MIN_ROWS = 6;
const MAX_ROWS = 24;

export function ThreadListSkeleton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowCount, setRowCount] = useState<number>(MIN_ROWS);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const height = el.clientHeight || el.parentElement?.clientHeight || 0;
      if (!height) return;
      const estimated = Math.ceil(height / ROW_HEIGHT_PX) + 1;
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
      <div
        className="relative overflow-hidden border-b border-[#e5e7eb] dark:border-[#ffffff]"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, rgba(212,169,85,0.08) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
        }}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="mb-2 flex items-center gap-2">
            <span
              aria-hidden
              className="block"
              style={{ width: 14, height: 1, background: "#1e2a4a" }}
            />
            <div
              className="h-2 w-24 animate-pulse rounded-sm bg-[#f3f4f6]"
            />
          </div>
          <div className="mb-3 h-7 w-2/3 animate-pulse rounded bg-[#f3f4f6]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[#f3f4f6]" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-[#ffffff]/95 px-5 py-2.5 dark:border-[#ffffff] dark:bg-[#ffffff]/95">
        <div
          className="h-3 w-32 animate-pulse rounded-sm bg-[#f3f4f6]"
        />
        <span
          aria-hidden
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(212,169,85,0.20) 0%, transparent 100%)",
          }}
        />
        <div
          className="h-2.5 w-10 animate-pulse rounded-sm bg-[#f3f4f6]"
        />
      </div>

      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  const senderWidth = 32 + ((index * 7) % 18);
  const subjectWidth = 60 + ((index * 11) % 28);
  const snippetWidth = 70 + ((index * 13) % 22);

  return (
    <div className="flex w-full min-h-[88px] items-start gap-3.5 border-b border-[#e5e7eb] px-5 py-4 pr-3 dark:border-[#ffffff]">
      <div
        className="h-10 w-10 shrink-0 animate-pulse bg-[#f3f4f6]"
        style={{
          borderRadius: 6,
          border: "1px solid #e5e7eb",
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div
            className="h-3.5 animate-pulse rounded-sm bg-[#f3f4f6]"
            style={{
              width: `${senderWidth}%`,
            }}
          />
          <div className="h-2.5 w-9 shrink-0 animate-pulse rounded-sm bg-[#f3f4f6]" />
        </div>
        <div
          className="h-3 animate-pulse rounded-sm bg-[#f3f4f6]"
          style={{
            width: `${subjectWidth}%`,
          }}
        />
        <div
          className="h-2.5 animate-pulse rounded-sm bg-[#f3f4f6]"
          style={{
            width: `${snippetWidth}%`,
          }}
        />
      </div>
    </div>
  );
}
