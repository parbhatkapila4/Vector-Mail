"use client";

export function ThreadViewSkeleton() {
  return (
    <div className="vm-thread-skel relative flex h-full flex-col bg-white dark:bg-[#ffffff]">
      <style dangerouslySetInnerHTML={{ __html: SKELETON_CSS }} />

      <div className="flex items-center gap-1 border-b border-[#eef0f4] bg-white px-6 py-3">
        <div className="vm-skel-bar" style={{ height: 28, width: 28, borderRadius: 7 }} />
        <span aria-hidden className="vm-skel-divider" />
        <div className="vm-skel-bar" style={{ height: 24, width: 78, borderRadius: 6 }} />
        <div className="vm-skel-bar" style={{ height: 24, width: 96, borderRadius: 6 }} />
        <div className="vm-skel-bar" style={{ height: 24, width: 80, borderRadius: 6 }} />
        <div className="vm-skel-bar" style={{ height: 24, width: 116, borderRadius: 6 }} />
        <div className="ml-auto flex items-center gap-2">
          <div className="vm-skel-bar" style={{ height: 28, width: 110, borderRadius: 7 }} />
          <div
            className="vm-skel-bar vm-skel-cta"
            style={{ height: 28, width: 96, borderRadius: 7 }}
          />
        </div>
      </div>

      <div className="px-6 pt-5">
        <div className="vm-skel-card">
          <div className="vm-skel-card-head">
            <div
              className="vm-skel-bar"
              style={{ height: 18, width: 18, borderRadius: 5 }}
            />
            <div
              className="vm-skel-bar"
              style={{ height: 11, width: 88, borderRadius: 3 }}
            />
            <div
              className="vm-skel-bar ml-auto"
              style={{ height: 11, width: 64, borderRadius: 3 }}
            />
          </div>
          <div className="mt-3 space-y-2">
            <div
              className="vm-skel-bar"
              style={{ height: 10, width: "32%", borderRadius: 3 }}
            />
            <div
              className="vm-skel-bar"
              style={{ height: 12, width: "92%", borderRadius: 3 }}
            />
            <div
              className="vm-skel-bar"
              style={{ height: 12, width: "78%", borderRadius: 3 }}
            />
            <div className="pt-2" />
            <div
              className="vm-skel-bar"
              style={{ height: 10, width: "38%", borderRadius: 3 }}
            />
            <div
              className="vm-skel-bar"
              style={{ height: 12, width: "84%", borderRadius: 3 }}
            />
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div
          className="vm-skel-bar"
          style={{ height: 28, width: "56%", borderRadius: 5 }}
        />
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="vm-skel-bar"
            style={{ height: 38, width: 38, borderRadius: 8 }}
          />
          <div className="flex flex-1 flex-col gap-2">
            <div
              className="vm-skel-bar"
              style={{ height: 14, width: 168, borderRadius: 4 }}
            />
            <div
              className="vm-skel-bar"
              style={{ height: 11, width: 56, borderRadius: 3 }}
            />
          </div>
          <div
            className="vm-skel-bar"
            style={{ height: 11, width: 128, borderRadius: 3 }}
          />
        </div>
      </div>

      <div className="px-6 pt-6 pb-8">
        <div className="flex flex-col gap-3">
          {[
            "92%",
            "100%",
            "86%",
            "78%",
            "94%",
            "62%",
            "48%",
            "0%",
            "88%",
            "96%",
            "72%",
            "84%",
          ].map((w, i) =>
            w === "0%" ? (
              <div key={i} style={{ height: 8 }} />
            ) : (
              <div
                key={i}
                className="vm-skel-bar"
                style={{
                  height: 12,
                  width: w,
                  borderRadius: 3,
                  animationDelay: `${i * 60}ms, ${i * 80}ms`,
                }}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

const SKELETON_CSS = `
  .vm-thread-skel { color: #0e1729; }

  /* Single bar: shimmer sweep + fade-in stagger */
  .vm-thread-skel .vm-skel-bar {
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(
        90deg,
        rgba(30, 42, 74, 0.06) 0%,
        rgba(30, 42, 74, 0.13) 25%,
        rgba(30, 42, 74, 0.20) 50%,
        rgba(30, 42, 74, 0.13) 75%,
        rgba(30, 42, 74, 0.06) 100%
      );
    background-size: 200% 100%;
    animation:
      vm-skel-sweep 1.6s ease-in-out infinite,
      vm-skel-fade 0.4s ease-out backwards;
    will-change: background-position, opacity, transform;
  }

  /* CTA-tinted variant for primary buttons in the toolbar */
  .vm-thread-skel .vm-skel-cta {
    background:
      linear-gradient(
        90deg,
        rgba(30, 42, 74, 0.18) 0%,
        rgba(30, 42, 74, 0.28) 25%,
        rgba(30, 42, 74, 0.40) 50%,
        rgba(30, 42, 74, 0.28) 75%,
        rgba(30, 42, 74, 0.18) 100%
      );
    background-size: 200% 100%;
  }

  /* Vertical hairline divider in toolbar */
  .vm-thread-skel .vm-skel-divider {
    display: inline-block;
    width: 1px;
    height: 18px;
    background: #e4e7ed;
    margin: 0 6px;
  }

  /* AI brief card chrome */
  .vm-thread-skel .vm-skel-card {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 1px 2px rgba(15, 20, 40, 0.04);
    animation: vm-skel-fade 0.45s ease-out 0.05s backwards;
  }
  .vm-thread-skel .vm-skel-card-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Stagger across all top-level skeleton bars (toolbar, header, sender row).
     Body bars get explicit per-row delays via style prop. */
  .vm-thread-skel > * { animation-delay: 0ms; }

  @keyframes vm-skel-sweep {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes vm-skel-fade {
    from { opacity: 0; transform: translateY(2px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .vm-thread-skel .vm-skel-bar,
    .vm-thread-skel .vm-skel-card {
      animation: none !important;
      background: rgba(30, 42, 74, 0.08) !important;
    }
  }
`;
