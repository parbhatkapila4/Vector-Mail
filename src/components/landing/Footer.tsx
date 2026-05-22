"use client";

import Image from "next/image";
import Link from "next/link";

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[6px]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/VectorMail-New.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
        sizes={`${size}px`}
        unoptimized
        priority
      />
    </span>
  );
}

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Brief 2.0", href: "/brief" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "mailto:parbhat@parbhat.work" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIALS: { label: string; href: string; svg: React.ReactNode }[] = [
  {
    label: "GitHub",
    href: "https://github.com/parbhatkapila4/Vector-Mail",
    svg: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
        <path d="M9 1C4.6 1 1 4.6 1 9c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1.1-2.7-1.1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.2.5.7.5 1.4v2c0 .2.1.5.5.4 3.2-1.1 5.5-4.1 5.5-7.6 0-4.4-3.6-8-8-8z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/parbhat-kapila/",
    svg: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
        <path d="M15.5 1H2.5C1.7 1 1 1.7 1 2.5v13c0 .8.7 1.5 1.5 1.5h13c.8 0 1.5-.7 1.5-1.5v-13c0-.8-.7-1.5-1.5-1.5zm-9 13H4V7h2.5v7zM5.2 6c-.8 0-1.5-.7-1.5-1.5S4.4 3 5.2 3s1.5.7 1.5 1.5S6.1 6 5.2 6zM14 14h-2.5v-3.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5V14H6V7h2.5v1c.5-.7 1.5-1.2 2.5-1.2 1.7 0 3 1.3 3 3V14z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/Parbhat03",
    svg: (
      <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
        <path d="M14.5 1h-2.7L9 5 6.2 1H1.5l5 7-5 8h2.7L8 11l3.8 5h4.7l-5.5-8 5.5-7zM4.7 14.5L7 11l-1.2-1.7-3.6 5.2h2.5zM13.3 14.5L9 8.5l1.2-1.7 5.6 7.7h-2.5z" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative isolate overflow-hidden bg-black px-5 pb-10 pt-12 md:px-8 md:pb-12 md:pt-16"
      data-nav-theme="dark"
    >
      <HalftoneWordmark />

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              aria-label="VectorMail"
              className="inline-flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--vmx-sans)",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              <BrandMark />
              VectorMail
            </Link>
            <p
              className="max-w-[280px]"
              style={{
                fontSize: 14.5,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
                fontFamily: "var(--vmx-sans)",
              }}
            >
              The intelligence layer for your inbox.
              <br />
              Built for production.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4
                className="mb-5 uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "var(--vmx-sans)",
                }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="transition-colors"
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 14.5,
                        fontWeight: 400,
                        fontFamily: "var(--vmx-sans)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "rgba(255,255,255,0.85)";
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--vmx-sans)",
            }}
          >
            © {year} VectorMail, Inc. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-grid h-7 w-7 place-items-center rounded transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.55)";
                }}
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function HalftoneWordmark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{ zIndex: 0 }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 22%, rgba(255,255,255,0.30) 0.4px, transparent 0.9px)," +
            "radial-gradient(circle at 78% 36%, rgba(255,255,255,0.22) 0.4px, transparent 0.9px)," +
            "radial-gradient(circle at 45% 14%, rgba(255,255,255,0.18) 0.3px, transparent 0.8px)," +
            "radial-gradient(circle at 88% 10%, rgba(255,255,255,0.25) 0.4px, transparent 0.9px)," +
            "radial-gradient(circle at 28% 48%, rgba(255,255,255,0.15) 0.3px, transparent 0.8px)",
          backgroundSize:
            "180px 180px, 240px 240px, 160px 160px, 300px 300px, 200px 200px",
          opacity: 0.55,
          zIndex: 0,
        }}
      />

      <div
        className="vmx-halo absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-40%",
          width: "120%",
          height: "120%",
          background:
            "radial-gradient(ellipse 55% 80% at 50% 100%, rgba(255,255,255,0.55) 0%, rgba(220,225,255,0.30) 22%, rgba(170,185,255,0.12) 45%, rgba(100,120,200,0.04) 62%, rgba(0,0,0,0) 78%)",
          filter: "blur(50px)",
          zIndex: 1,
        }}
      />

      <div
        aria-hidden
        className="absolute left-0 right-0"
        style={{
          bottom: "10%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.0) 8%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.0) 92%, transparent 100%)",
          zIndex: 3,
          filter: "blur(0.3px)",
        }}
      />

      <h2
        className="absolute left-1/2 m-0 -translate-x-1/2 p-0"
        style={{
          bottom: "-18%",
          zIndex: 2,
          fontFamily: "var(--vmx-sans)",
          fontWeight: 900,
          letterSpacing: "-0.07em",
          lineHeight: 0.85,
          fontSize: "clamp(120px, 22vw, 360px)",
          whiteSpace: "nowrap",
          color: "#ffffff",
          opacity: 0.6,
          WebkitMaskImage:
            "radial-gradient(circle, #000 1.4px, transparent 1.8px)",
          maskImage: "radial-gradient(circle, #000 1.4px, transparent 1.8px)",
          WebkitMaskSize: "6px 6px",
          maskSize: "6px 6px",
          WebkitMaskRepeat: "repeat",
          maskRepeat: "repeat",
          filter:
            "drop-shadow(0 0 24px rgba(255,255,255,0.25)) drop-shadow(0 0 80px rgba(180,200,255,0.18))",
        }}
      >
        VectorMail
      </h2>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #000 0%, #000 28%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.6) 96%, #000 100%)",
          zIndex: 4,
        }}
      />

      <div
        aria-hidden
        className="absolute inset-y-0 left-0"
        style={{
          width: "10%",
          background:
            "linear-gradient(to right, #000 0%, rgba(0,0,0,0) 100%)",
          zIndex: 4,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0"
        style={{
          width: "10%",
          background:
            "linear-gradient(to left, #000 0%, rgba(0,0,0,0) 100%)",
          zIndex: 4,
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (prefers-reduced-motion: no-preference) {
              .vmx-halo { animation: vmx-halo-breathe 7s ease-in-out infinite; }
            }
            @keyframes vmx-halo-breathe {
              0%, 100% { opacity: 0.9;  transform: translateX(-50%) scale(1); }
              50%      { opacity: 1;    transform: translateX(-50%) scale(1.04); }
            }
          `,
        }}
      />
    </div>
  );
}
