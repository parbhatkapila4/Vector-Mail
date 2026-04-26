"use client";

import Link from "next/link";

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 30 30" fill="none" width={size} height={size}>
        <rect x="3" y="6" width="24" height="18" rx="3" fill="#0a0a0a" />
        <g
          stroke="#9d7af3"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 11l3 4-3 4" />
          <path d="M13 11l3 4-3 4" />
          <path d="M19 11l3 4-3 4" />
        </g>
      </svg>
    </span>
  );
}

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Brief 2.0", href: "/brief" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Founders", href: "/?usecase=founders#use-cases" },
      { label: "Sales", href: "/?usecase=sales#use-cases" },
      { label: "Engineering", href: "/?usecase=engineering#use-cases" },
      { label: "Customer Support", href: "/?usecase=support#use-cases" },
      { label: "Investors", href: "/?usecase=investors#use-cases" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact Us", href: "mailto:parbhat@parbhat.work" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-5 pb-12 pt-[72px] md:px-8">
      <div className="relative z-[1] mx-auto grid max-w-[1280px] grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-5">
          <Link
            href="/"
            aria-label="VectorMail"
            className="flex items-center gap-2.5 leading-none transition-opacity hover:opacity-90"
            style={{
              color: "var(--vmx-ink, #0a0a0a)",
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
              fontSize: 14,
              color: "var(--vmx-ink-2, #4a4a4a)",
              lineHeight: 1.5,
            }}
          >
            A drop-in intelligence layer for the email you already use. Built
            for production.
          </p>

          <div className="mt-2 flex gap-3.5">
            {[
              {
                label: "X",
                href: "https://x.com/Parbhat03",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M14.5 1h-2.7L9 5 6.2 1H1.5l5 7-5 8h2.7L8 11l3.8 5h4.7l-5.5-8 5.5-7zM4.7 14.5L7 11l-1.2-1.7-3.6 5.2h2.5zM13.3 14.5L9 8.5l1.2-1.7 5.6 7.7h-2.5z" />
                  </svg>
                ),
              },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/parbhat-kapila/",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M15.5 1H2.5C1.7 1 1 1.7 1 2.5v13c0 .8.7 1.5 1.5 1.5h13c.8 0 1.5-.7 1.5-1.5v-13c0-.8-.7-1.5-1.5-1.5zm-9 13H4V7h2.5v7zM5.2 6c-.8 0-1.5-.7-1.5-1.5S4.4 3 5.2 3s1.5.7 1.5 1.5S6.1 6 5.2 6zM14 14h-2.5v-3.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5V14H6V7h2.5v1c.5-.7 1.5-1.2 2.5-1.2 1.7 0 3 1.3 3 3V14z" />
                  </svg>
                ),
              },
              {
                label: "GitHub",
                href: "https://github.com/parbhatkapila4/Vector-Mail",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M9 1C4.6 1 1 4.6 1 9c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1.1-2.7-1.1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.2.5.7.5 1.4v2c0 .2.1.5.5.4 3.2-1.1 5.5-4.1 5.5-7.6 0-4.4-3.6-8-8-8z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid place-items-center rounded-[7px] transition-all"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid var(--vmx-line-strong, #d6cfe5)",
                  color: "var(--vmx-ink-2, #4a4a4a)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--vmx-ink, #0a0a0a)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--vmx-ink, #0a0a0a)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.5)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--vmx-ink-2, #4a4a4a)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--vmx-line-strong, #d6cfe5)";
                }}
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4
              className="mb-4 uppercase"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--vmx-ink-3, #767676)",
              }}
            >
              {col.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="transition-colors"
                    style={{
                      color: "var(--vmx-ink-1, #1f1f1f)",
                      fontSize: 14.5,
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--vmx-lav-bright, #9d7af3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--vmx-ink-1, #1f1f1f)";
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

      <div
        className="mx-auto mt-16 flex max-w-[1280px] flex-wrap items-center justify-between gap-3 pt-6 text-[13px]"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.08)",
          color: "var(--vmx-ink-3, #767676)",
        }}
      >
        <span>© {year} VectorMail, Inc.</span>
        <span style={{ fontFamily: "var(--vmx-mono)", fontSize: 11.5 }}>
          v2.4 · all systems operational
        </span>
      </div>
    </footer>
  );
}
