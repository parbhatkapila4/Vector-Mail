"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIDEO_SRC = "/vectormail-walkthrough.mp4";

export function FinalCTA() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div
      className="relative isolate overflow-hidden"
      data-nav-theme="dark"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 95% 110px at 50% 8%, rgba(28,38,82,0.55), transparent 75%)," +
            "radial-gradient(ellipse 95% 70px at 50% 24%, rgba(210,222,255,0.55), transparent 70%)," +
            "radial-gradient(ellipse 100% 90px at 50% 38%, rgba(165,185,235,0.42), transparent 72%)," +
            "radial-gradient(ellipse 95% 80px at 50% 52%, rgba(115,140,210,0.50), transparent 70%)," +
            "radial-gradient(ellipse 95% 70px at 50% 68%, rgba(70,90,170,0.32), transparent 75%)," +
            "#000000",
        }}
      />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-8 px-5 py-20 text-center md:px-8 md:py-28 xl:py-32">
        <h2
          className="text-white"
          style={{
            fontSize: "clamp(56px, 8vw, 112px)",
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 0.92,
            fontFamily: "var(--vmx-sans)",
          }}
        >
          Read. Draft. Send.
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/api/demo/enter"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-[15px] font-medium text-black transition-transform duration-300 hover:scale-[0.97] active:scale-95 xl:h-[50px] xl:px-7 xl:text-[17px]"
            style={{ fontFamily: "var(--vmx-sans)" }}
          >
            See it in action
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative isolate inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-black/50 p-px font-medium text-white transition-all duration-300 hover:scale-[0.97] active:scale-95 xl:h-[50px]"
            style={{ fontFamily: "var(--vmx-sans)" }}
          >
            <span
              aria-hidden
              className="absolute -inset-[140%] -z-10 animate-spin transition-transform duration-500 group-hover:scale-110 motion-reduce:animate-none"
              style={{
                background:
                  "conic-gradient(from 90deg, rgba(95,63,139,0) 0deg, rgba(95,63,139,0) 230deg, #2b1a46 275deg, #48f5ee 298deg, #ffffb8 312deg, #ff6b62 330deg, #52253a 352deg, rgba(95,63,139,0) 360deg)",
                animationDuration: "3s",
              }}
            />
            <span className="flex h-full items-center justify-center gap-2 rounded-[11px] bg-[#0b0b0b] px-6 text-[15px] xl:px-7 xl:text-[17px]">
              <span
                aria-hidden
                className="grid h-4 w-4 place-items-center rounded-full"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  fontSize: 8,
                  paddingLeft: 1,
                }}
              >
                ▶
              </span>
              Watch the walkthrough
            </span>
          </button>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(<VideoModal onClose={close} />, document.body)}
    </div>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch {
        }
      }
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VectorMail walkthrough video"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 md:px-8"
      style={{
        background: "rgba(6, 4, 2, 0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "vm-modal-backdrop-in 260ms ease-out",
        fontFamily: "var(--vmx-sans)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1100px]"
        style={{
          animation:
            "vm-modal-frame-in 360ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "var(--vmx-mono)",
              fontWeight: 600,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "#7fd49a",
                boxShadow: "0 0 6px #7fd49a",
              }}
            />
            VectorMail · Walkthrough
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close walkthrough"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-white/[0.08]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.14)",
              letterSpacing: "-0.1px",
            }}
          >
            <span
              aria-hidden
              className="grid h-4 w-4 place-items-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.12)",
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              ×
            </span>
            Close
            <span
              aria-hidden
              className="rounded px-1 py-px text-[10px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                fontFamily: "var(--vmx-mono)",
                letterSpacing: "0.3px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Esc
            </span>
          </button>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[2px] rounded-[20px]"
            style={{
              background:
                "conic-gradient(from 120deg, rgba(95,63,139,0) 0deg, #2b1a46 60deg, #48f5ee 90deg, #ffffb8 120deg, #ff6b62 160deg, #52253a 200deg, rgba(95,63,139,0) 240deg, rgba(95,63,139,0) 360deg)",
              filter: "blur(18px)",
              opacity: 0.5,
            }}
          />
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              aspectRatio: "16 / 9",
              background: "#000",
              boxShadow:
                "0 32px 96px -16px rgba(0,0,0,0.65), 0 8px 24px -8px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              controls
              controlsList="nodownload"
              autoPlay
              playsInline
              preload="metadata"
              disablePictureInPicture
              className="block h-full w-full"
              style={{ background: "#000", outline: "none" }}
            />
          </div>
        </div>

        <div
          className="mt-4 text-center"
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "-0.1px",
          }}
        >
          A short tour through Buddy, daily briefs, and Autopilot — the
          three surfaces that handle most of your inbox.
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes vm-modal-backdrop-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes vm-modal-frame-in {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
`,
        }}
      />
    </div>
  );
}
