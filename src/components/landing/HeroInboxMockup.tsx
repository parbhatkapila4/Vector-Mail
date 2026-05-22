"use client";

import Image from "next/image";

const C = {
  surface: "#FBF8F1",
  surface2: "#F4EFE4",
  surface3: "#EBE5D5",
  border: "rgba(58, 46, 28, 0.10)",
  borderStrong: "rgba(58, 46, 28, 0.18)",

  text: "#2A2418",
  text2: "#5C5340",
  text3: "#8B8068",
  text4: "#B4A88B",

  brand: "#1F3A2E",
  brand2: "#14271F",
  brandSoft: "#DDE6E0",
  brandText: "#14271F",

  selectBg: "#F0E2CE",
  selectLine: "#8B4B2E",

  accent: "#B85A2B",
  accentSoft: "#F2DDC8",
  accentText: "#5C2B11",

  warmSoft: "#F2DDC8",
  warmText: "#5C2B11",
  hotSoft: "#F0D4CB",
  hotText: "#5C1F12",
  coolSoft: "#DDE7EB",
  coolText: "#1F3D47",
  goodSoft: "#E0E8D5",
  goodText: "#2A3D1F",
  good: "#4A6B3A",
  gold: "#A68419",
  goldSoft: "#F0E5BD",
  goldText: "#5C4708",
};

const FONT = "var(--vmx-sans), 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const MONO = "var(--vmx-mono), 'JetBrains Mono', ui-monospace, monospace";

export function HeroInboxMockup() {
  return (
    <div
      className="relative w-full overflow-x-auto rounded-2xl"
      style={{
        textAlign: "left",
        background: C.surface,
        border: `0.5px solid ${C.borderStrong}`,
        boxShadow:
          "0 24px 64px -24px rgba(20,16,40,0.32), 0 8px 24px -8px rgba(20,16,40,0.18)",
        color: C.text,
        fontFamily: FONT,
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: "252px 356px 1fr 332px",
          minWidth: 1380,
          minHeight: 780,
        }}
      >
        <LeftNav />
        <ThreadList />
        <ThreadView />
        <ContextRail />
      </div>
    </div>
  );
}

function BuddyMark({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(3, Math.round(size * 0.22)),
      }}
    >
      <Image
        src="/Opus-B.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
  );
}

function LeftNav() {
  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        background: C.surface2,
        borderRight: `0.5px solid ${C.border}`,
        padding: "18px 14px 16px",
      }}
    >
      <div className="flex items-center gap-2.5" style={{ padding: "2px 6px 22px" }}>
        <div
          className="grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-lg"
          style={{
            background: C.brand,
            color: C.surface,
            position: "relative",
          }}
        >
          <Image
            src="/VectorMail-New.png"
            alt=""
            width={22}
            height={22}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.3px",
              color: C.text,
            }}
          >
            VectorMail
          </span>
        </div>
      </div>

      <button
        type="button"
        className="relative flex items-center gap-2"
        style={{
          background: C.brand,
          color: C.surface,
          border: "none",
          padding: "9px 12px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          fontFamily: FONT,
          marginBottom: 22,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="grid h-4 w-4 place-items-center rounded"
          style={{
            background: "rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.95)",
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          +
        </span>
        Compose
        <span
          className="ml-auto rounded"
          style={{
            fontSize: 10,
            opacity: 0.7,
            fontFamily: MONO,
            background: "rgba(255,255,255,0.12)",
            padding: "1px 5px",
            letterSpacing: "0.3px",
          }}
        >
          ⌘N
        </span>
      </button>

      <NavSection
        items={[
          { label: "Inbox", icon: "In", count: "14,247", active: true },
          { label: "Today's brief", icon: "★", count: "247" },
          { label: "Needs reply", icon: "↩", count: "24", pill: true },
          { label: "Important", icon: "!", count: "184" },
          { label: "Can wait", icon: "⌛", count: "12,847" },
        ]}
      />

      <SectionLabel>Smart labels</SectionLabel>
      <NavSection
        items={[
          { label: "Investors", dot: "#4A6B3A", count: "47" },
          { label: "Clients", dot: "#3A6B7A", count: "247" },
          { label: "Job search", dot: "#B85A2B", count: "89" },
          { label: "Personal", dot: "#8B8068", count: "1,247" },
        ]}
      />

      <SectionLabel>Other</SectionLabel>
      <NavSection
        items={[
          { label: "Drafts", icon: "D", count: "12" },
          { label: "Sent", icon: "S" },
          { label: "Archive", icon: "A" },
        ]}
      />

      <SectionLabel>Autopilot</SectionLabel>
      <div
        style={{
          textAlign: "left",
          background: C.surface,
          border: `0.5px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            padding: "8px 12px",
            background: C.brand,
            color: C.surface,
          }}
        >
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.8px",
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: 6,
                height: 6,
                background: "#7fd49a",
                boxShadow: "0 0 0 2px rgba(127, 212, 154, 0.22), 0 0 6px #7fd49a",
              }}
            />
            ACTIVE
          </span>
          <span
            style={{
              fontSize: 9.5,
              color: "rgba(255,255,255,0.6)",
              fontFamily: MONO,
              letterSpacing: "0.3px",
            }}
          >
            Founder mode
          </span>
        </div>

        <div className="flex flex-col" style={{ padding: "6px 0" }}>
          {[
            {
              verb: "Replied",
              obj: "Stripe receipt",
              time: "2m",
              icon: "✓",
              tone: "good" as const,
            },
            {
              verb: "Archived",
              obj: "8 newsletters",
              time: "5m",
              icon: "↓",
              tone: "cool" as const,
            },
            {
              verb: "Snoozed",
              obj: "bank notice",
              time: "12m",
              icon: "Z",
              tone: "neutral" as const,
            },
          ].map((a, i) => {
            const toneColor =
              a.tone === "good"
                ? { bg: C.goodSoft, fg: C.goodText }
                : a.tone === "cool"
                  ? { bg: C.coolSoft, fg: C.coolText }
                  : { bg: C.surface3, fg: C.text2 };
            return (
              <div
                key={i}
                className="flex items-center"
                style={{
                  gap: 8,
                  padding: "6px 12px",
                  fontSize: 11,
                }}
              >
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded"
                  style={{
                    background: toneColor.bg,
                    color: toneColor.fg,
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: MONO,
                  }}
                >
                  {a.icon}
                </span>
                <span style={{ color: C.text, fontWeight: 500 }}>{a.verb}</span>
                <span
                  className="truncate"
                  style={{ color: C.text3, flex: 1 }}
                >
                  {a.obj}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: C.text3,
                    fontFamily: MONO,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {a.time}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            padding: "9px 12px",
            background: C.accentSoft,
            color: C.accentText,
            fontSize: 11,
            fontWeight: 600,
            borderTop: `0.5px solid rgba(184, 90, 43, 0.18)`,
          }}
        >
          <span className="flex items-center" style={{ gap: 6 }}>
            <span
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full"
              style={{
                background: C.accent,
                color: C.surface,
                fontSize: 9,
                fontWeight: 700,
                fontFamily: MONO,
              }}
            >
              3
            </span>
            Awaiting your call
          </span>
          <span style={{ fontSize: 12 }}>→</span>
        </div>
      </div>

      <div
        className="mt-auto flex items-center gap-2.5"
        style={{
          paddingTop: 14,
          borderTop: `0.5px solid ${C.border}`,
        }}
      >
        <span
          className="grid h-[30px] w-[30px] place-items-center rounded-full"
          style={{
            background: C.brand,
            color: C.surface,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "-0.3px",
          }}
        >
          PK
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: C.text,
              letterSpacing: "-0.2px",
            }}
          >
            Parbhat Kapila
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{
              fontSize: 10,
              color: C.good,
              marginTop: 1,
              fontWeight: 500,
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: C.good,
                boxShadow: "0 0 0 2px rgba(74, 107, 58, 0.18)",
              }}
            />
            Online
          </div>
        </div>
        <span
          className="grid h-4 w-4 place-items-center rounded"
          style={{
            background: C.surface3,
            color: C.text3,
            fontSize: 11,
            fontFamily: MONO,
          }}
        >
          ⚙
        </span>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "18px 9px 8px",
        fontSize: 10,
        color: C.text4,
        letterSpacing: "0.9px",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

interface NavItem {
  label: string;
  icon?: string;
  count?: string;
  active?: boolean;
  pill?: boolean;
  dot?: string;
}

function NavSection({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-col" style={{ gap: 1 }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center"
          style={{
            textAlign: "left",
            gap: 10,
            padding: "7px 10px",
            borderRadius: 6,
            fontSize: 13,
            color: item.active ? C.surface : C.text2,
            background: item.active ? C.brand : "transparent",
            fontWeight: item.active ? 500 : 450,
          }}
        >
          {item.dot && (
            <span
              className="inline-block shrink-0 rounded-full"
              style={{
                width: 7,
                height: 7,
                background: item.dot,
                marginLeft: 4,
                marginRight: 2,
              }}
            />
          )}
          {item.icon && (
            <span
              className="grid h-4 w-4 shrink-0 place-items-center rounded"
              style={{
                background: item.active ? "rgba(255,255,255,0.18)" : C.surface3,
                color: item.active ? C.surface : C.text3,
                fontSize: 9,
                fontWeight: 600,
                fontFamily: MONO,
              }}
            >
              {item.icon}
            </span>
          )}
          <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
          {item.count && (
            <span
              className="ml-auto"
              style={{
                minWidth: 56,
                display: "inline-flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {item.pill ? (
                <span
                  style={{
                    padding: "1px 8px",
                    background: C.accentSoft,
                    color: C.accentText,
                    borderRadius: 9,
                    fontWeight: 600,
                    fontSize: 10.5,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.count}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    color: item.active ? "rgba(255,255,255,0.7)" : C.text3,
                    fontFamily: MONO,
                    fontWeight: 500,
                    letterSpacing: "-0.2px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.count}
                </span>
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

type Av = "warm" | "cool" | "good" | "brand" | "neutral" | "ink";

type ThreadAvatar =
  | { kind: Av; initials: string }
  | { kind: "logo"; src: string };

interface ThreadRow {
  from: string;
  fromMeta?: string;
  time: string;
  avatar: ThreadAvatar;
  tags?: { label: string; tone: "brand" | "hot" | "cool" | "warm" }[];
  subject: string;
  preview: string;
  unread?: boolean;
  selected?: boolean;
  starred?: boolean;
}

const LOGO_BASE = "/hero%20logo";

const THREADS: ThreadRow[] = [
  {
    from: "X (Twitter)",
    fromMeta: "@samuel_lee",
    time: "2h",
    avatar: { kind: "logo", src: `${LOGO_BASE}/X.hero.png` },
    tags: [
      { label: "X DM", tone: "brand" },
      { label: "Hot", tone: "hot" },
    ],
    subject: "@samuel_lee sent you a direct message",
    preview: "Hey - tried VectorMail today, blown away. Founder of Stack Labs…",
    unread: true,
    selected: true,
  },
  {
    from: "Daniel Park",
    time: "4h",
    avatar: { kind: "logo", src: `${LOGO_BASE}/def.hero.png` },
    tags: [
      { label: "Compass Capital", tone: "cool" },
      { label: "Investor", tone: "warm" },
    ],
    subject: "Quick intro - your launch caught our eye",
    preview: "Series A follow-on signal · 30 minutes next week?",
    unread: true,
  },
  {
    from: "Stripe",
    time: "6h",
    avatar: { kind: "logo", src: `${LOGO_BASE}/Stripe.hero.png` },
    starred: true,
    subject: "Payout · $42,180 settled to account",
    preview: "Expected in your bank by May 19",
  },
  {
    from: "GitHub",
    fromMeta: "parbhatkapila4",
    time: "8h",
    avatar: { kind: "logo", src: `${LOGO_BASE}/git.hero.png` },
    subject: "PR #234 ready for review - semantic-rerank",
    preview: "3 commits · +412 −89 · 4 files changed",
    unread: true,
  },
  {
    from: "Calendly",
    time: "12h",
    avatar: { kind: "logo", src: `${LOGO_BASE}/Cal.hero.png` },
    subject: "New event · Tue May 19, 11:00 AM PT",
    preview: "Stack Labs team intro · Thursday 11 AM PT confirmed",
  },
  {
    from: "Linear",
    time: "1d",
    avatar: { kind: "logo", src: `${LOGO_BASE}/Linear.hero.png` },
    subject: "3 issues assigned to you · ING-241",
    preview: "P1: chunk reuse cache invalidation regression",
  },
  {
    from: "Notion",
    time: "1d",
    avatar: { kind: "logo", src: `${LOGO_BASE}/Notion.hero.png` },
    subject: "Your weekly digest - 14 pages updated",
    preview: "Outreach tracker · Daily schedule · OKRs Q2",
  },
  {
    from: "Vercel",
    time: "2d",
    avatar: { kind: "logo", src: `${LOGO_BASE}/vercel.hero.png` },
    subject: "Deployment ready · vectormail.app",
    preview: "Production build succeeded in 47s",
  },
  {
    from: "LinkedIn",
    fromMeta: "InMail",
    time: "2d",
    avatar: { kind: "logo", src: `${LOGO_BASE}/Linkedin.hero.png` },
    subject: "Mark from Accel wants to connect",
    preview: "Following Sentinel for a while - love to chat about Series B",
  },
  {
    from: "Account notices",
    fromMeta: "auto-mail",
    time: "3d",
    avatar: { kind: "logo", src: `${LOGO_BASE}/def.hero.png` },
    subject: "View: Monthly statement ready for review",
    preview: "Dear customer, your May account summary is now available",
  },
];

function ThreadList() {
  return (
    <section
      className="flex flex-col overflow-hidden"
      style={{
        borderRight: `0.5px solid ${C.border}`,
        background: C.surface,
      }}
    >
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: `0.5px solid ${C.border}`,
        }}
      >
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.4px",
              color: C.text,
            }}
          >
            Inbox
          </h2>
          <span
            style={{
              fontSize: 11,
              color: C.text3,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.1px",
            }}
          >
            14,247 · 24 unread
          </span>
        </div>
        <div className="relative">
          <span
            className="absolute left-2.5 top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded"
            style={{
              background: C.surface3,
              color: C.text3,
              fontSize: 9,
              fontFamily: MONO,
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search or ask Buddy…"
            className="w-full"
            style={{
              padding: "8px 12px 8px 30px",
              fontSize: 12.5,
              border: `0.5px solid ${C.borderStrong}`,
              borderRadius: 10,
              background: C.surface2,
              fontFamily: FONT,
              color: C.text,
              letterSpacing: "-0.1px",
              outline: "none",
            }}
            readOnly
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded"
            style={{
              fontSize: 10,
              color: C.text3,
              fontFamily: MONO,
              background: C.surface,
              padding: "1px 5px",
              border: `0.5px solid ${C.border}`,
              letterSpacing: "0.2px",
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <div
        className="flex gap-1.5"
        style={{
          padding: "10px 18px",
          borderBottom: `0.5px solid ${C.border}`,
          overflowX: "auto",
        }}
      >
        {[
          { l: "All", active: true },
          { l: "Unread" },
          { l: "Starred" },
          { l: "Investors" },
          { l: "Clients" },
        ].map((c) => (
          <button
            key={c.l}
            type="button"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 99,
              border: `0.5px solid ${c.active ? C.brand : C.borderStrong}`,
              background: c.active ? C.brand : C.surface,
              color: c.active ? C.surface : C.text2,
              whiteSpace: "nowrap",
              fontFamily: FONT,
              letterSpacing: "-0.1px",
            }}
          >
            {c.l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {THREADS.map((t, i) => (
          <ThreadCell key={i} thread={t} />
        ))}
      </div>
    </section>
  );
}

const AVATAR_STYLES: Record<Av, { bg: string; color: string }> = {
  warm: { bg: C.warmSoft, color: C.warmText },
  cool: { bg: C.coolSoft, color: C.coolText },
  good: { bg: C.goodSoft, color: C.goodText },
  brand: { bg: C.brandSoft, color: C.brandText },
  neutral: { bg: C.surface3, color: C.text2 },
  ink: { bg: C.text, color: C.surface },
};

const TAG_STYLES: Record<
  "brand" | "hot" | "cool" | "warm",
  { bg: string; color: string }
> = {
  brand: { bg: C.brandSoft, color: C.brandText },
  hot: { bg: C.hotSoft, color: C.hotText },
  cool: { bg: C.coolSoft, color: C.coolText },
  warm: { bg: C.warmSoft, color: C.warmText },
};

function ThreadCell({ thread }: { thread: ThreadRow }) {
  const selected = !!thread.selected;
  const unread = !!thread.unread;
  return (
    <div
      className="relative"
      style={{
        textAlign: "left",
        padding: "13px 18px",
        borderBottom: `0.5px solid ${C.border}`,
        background: selected ? C.selectBg : "transparent",
        boxShadow: selected ? `inset 2px 0 0 0 ${C.selectLine}` : undefined,
      }}
    >
      {unread && (
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: selected ? 9 : 7,
            width: 5,
            height: 5,
            background: selected ? C.selectLine : C.accent,
          }}
        />
      )}
      <div className="flex items-start gap-2.5">
        {thread.avatar.kind === "logo" ? (
          <span
            className="relative grid shrink-0 place-items-center overflow-hidden rounded-full"
            style={{
              width: 34,
              height: 34,
              background: C.surface,
              border: `0.5px solid ${C.border}`,
            }}
          >
            <Image
              src={thread.avatar.src}
              alt=""
              width={34}
              height={34}
              className="h-full w-full object-cover"
              unoptimized
            />
          </span>
        ) : (
          <span
            className="grid shrink-0 place-items-center rounded-full"
            style={{
              width: 34,
              height: 34,
              background: AVATAR_STYLES[thread.avatar.kind].bg,
              color: AVATAR_STYLES[thread.avatar.kind].color,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "-0.3px",
            }}
          >
            {thread.avatar.initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <span
              className="truncate"
              style={{
                fontSize: 13,
                letterSpacing: "-0.2px",
                color: unread ? C.text : C.text2,
                fontWeight: unread ? 600 : 500,
              }}
            >
              {thread.from}
              {thread.fromMeta && (
                <span
                  style={{
                    fontWeight: 400,
                    color: C.text3,
                    fontSize: 11,
                    marginLeft: 6,
                  }}
                >
                  {thread.fromMeta}
                </span>
              )}
              {thread.starred && (
                <span style={{ color: C.gold, fontSize: 11, marginLeft: 4 }}>
                  ★
                </span>
              )}
            </span>
            <span
              className="shrink-0"
              style={{
                fontSize: 10,
                color: C.text3,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.1px",
              }}
            >
              {thread.time}
            </span>
          </div>
          {thread.tags && thread.tags.length > 0 && (
            <div className="mb-1 flex flex-wrap items-center gap-1">
              {thread.tags.map((tag) => {
                const ts = TAG_STYLES[tag.tone];
                return (
                  <span
                    key={tag.label}
                    style={{
                      fontSize: 10,
                      padding: "1px 7px",
                      borderRadius: 3,
                      fontWeight: 600,
                      letterSpacing: "0.1px",
                      background: ts.bg,
                      color: ts.color,
                    }}
                  >
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}
          <div
            className="truncate"
            style={{
              fontSize: 12.5,
              fontWeight: unread ? 600 : 500,
              letterSpacing: "-0.2px",
              color: C.text,
              marginBottom: 2,
            }}
          >
            {thread.subject}
          </div>
          <div
            className="truncate"
            style={{
              fontSize: 11.5,
              color: C.text3,
              lineHeight: 1.45,
              letterSpacing: "-0.1px",
            }}
          >
            {thread.preview}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadView() {
  return (
    <main
      className="flex min-w-0 flex-col overflow-hidden"
      style={{ background: C.surface }}
    >
      <div
        className="flex items-center"
        style={{
          padding: "12px 26px 12px 14px",
          borderBottom: `0.5px solid ${C.border}`,
          background: C.surface,
          gap: 2,
        }}
      >
        <ToolBtn label="‹" />
        <div
          className="flex items-center"
          style={{
            gap: 6,
            fontSize: 11.5,
            color: C.text3,
            letterSpacing: "-0.1px",
          }}
        >
          <span>Inbox</span>
          <span style={{ color: C.text4 }}>/</span>
          <b style={{ color: C.text2, fontWeight: 500 }}>Hot leads</b>
        </div>
        <span
          className="mx-1.5"
          style={{ width: 1, height: 16, background: C.borderStrong }}
        />
        <ToolBtn label="A" />
        <ToolBtn label="Z" />
        <ToolBtn label="★" />
        <ToolBtn label="⋯" />
        <div
          className="ml-auto flex items-center"
          style={{
            padding: "5px 11px",
            background: C.accentSoft,
            color: C.accentText,
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1px",
            gap: 6,
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: C.accent,
              boxShadow: "0 0 0 2px rgba(184, 90, 43, 0.2)",
              animation: "vm-mockup-pulse 2.2s infinite ease-in-out",
            }}
          />
          Awaiting reply · 2h 14m
        </div>
      </div>

      <div
        style={{
          padding: "22px 26px 18px",
          borderBottom: `0.5px solid ${C.border}`,
        }}
      >
        <h1
          style={{
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.5px",
            lineHeight: 1.3,
            marginBottom: 7,
            color: C.text,
          }}
        >
          @samuel_lee sent you a direct message
        </h1>
        <div
          className="flex items-center"
          style={{
            gap: 10,
            fontSize: 11,
            color: C.text3,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.1px",
          }}
        >
          <span>8 messages</span>
          <Dot />
          <span>2 participants</span>
          <Dot />
          <span>Started 2h ago</span>
          <Dot />
          <span style={{ color: C.good, fontWeight: 500 }}>● Active</span>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden"
        style={{ padding: "22px 26px 18px", background: C.surface }}
      >
        <Message
          who="Samuel Lee"
          when="2:14 PM · via X DM"
          av={{ kind: "logo", src: `${LOGO_BASE}/X.hero.png` }}
        >
          <div
            style={{
              background: C.surface2,
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: C.text,
              maxWidth: "86%",
              border: `0.5px solid ${C.border}`,
              letterSpacing: "-0.1px",
            }}
          >
            Hey - just tried VectorMail today and quietly impressed. Founder
            of Stack Labs (Series B fintech, ~80 ppl drowning in email). How
            are you handling team rollouts?
          </div>
        </Message>

        <Message
          who="You"
          when="Mon · 2:18 PM"
          av={{ kind: "logo", src: `${LOGO_BASE}/def.hero.png` }}
          out
        >
          <div
            className="relative"
            style={{
              background: C.brand,
              color: C.surface,
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13.5,
              lineHeight: 1.6,
              maxWidth: "86%",
              border: `0.5px solid ${C.brand}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              letterSpacing: "-0.1px",
            }}
          >
            Hey Samuel - appreciate the kind words. Team rollout is per-
            workspace OAuth, then everyone gets their own daily brief from
            day 1. Happy to walk through it - 30 min Thursday?
          </div>
          <div
            className="mt-1.5 flex items-center gap-1"
            style={{
              fontSize: 10,
              color: C.text3,
              letterSpacing: "-0.1px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              style={{ color: C.good, fontSize: 11, letterSpacing: "-2px" }}
            >
              ✓✓
            </span>{" "}
            Read 2h ago
          </div>
        </Message>

        <Message
          who="Samuel Lee"
          when="2:31 PM · via X DM"
          av={{ kind: "logo", src: `${LOGO_BASE}/X.hero.png` }}
        >
          <div
            className="inline-flex items-center"
            style={{
              gap: 11,
              background: C.surface,
              border: `0.5px solid ${C.borderStrong}`,
              borderRadius: 10,
              padding: "10px 12px 10px 10px",
              maxWidth: "86%",
            }}
          >
            <span
              className="grid place-items-center rounded-md"
              style={{
                width: 36,
                height: 36,
                background: C.hotSoft,
                color: C.hotText,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "-0.3px",
              }}
            >
              PNG
            </span>
            <div className="flex flex-col leading-tight">
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "-0.2px",
                  color: C.text,
                }}
              >
                stack-labs-inbox.png
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  color: C.text3,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.1px",
                  marginTop: 1,
                }}
              >
                1.2 MB · screenshot · scanned by Buddy
              </span>
            </div>
            <button
              type="button"
              className="ml-1"
              style={{
                background: C.brand,
                color: C.surface,
                border: "none",
                padding: "5px 11px",
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: FONT,
                letterSpacing: "-0.1px",
              }}
            >
              Open
            </button>
          </div>
        </Message>

        <Message
          who="Buddy"
          when="Private note · only you can see this"
          av={{ kind: "logo", src: "/Opus-B.png" }}
          whoColor={C.brandText}
        >
          <div
            style={{
              background: C.goldSoft,
              border: "0.5px solid rgba(166, 132, 25, 0.35)",
              borderRadius: 12,
              padding: "13px 16px",
              maxWidth: "86%",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <BuddyMark size={18} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                  color: C.brandText,
                }}
              >
                Context brief
              </span>
              <span
                className="ml-auto"
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: C.accentText,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  padding: "1px 6px",
                  background: "rgba(184, 90, 43, 0.14)",
                  borderRadius: 3,
                }}
              >
                Hot lead
              </span>
            </div>
            <div
              style={{
                fontSize: 12.5,
                lineHeight: 1.6,
                color: C.goldText,
                letterSpacing: "-0.1px",
              }}
            >
              Samuel runs Stack Labs (Series B fintech, ~80 ppl). He&apos;s
              been tweeting about email overload for 6 months - strong signal
              he&apos;s actively shopping. Suggest a 30-min team-rollout
              walkthrough + one fintech customer reference.
            </div>
          </div>
        </Message>

        <Message
          who="Samuel Lee"
          when="3:02 PM · via X DM"
          av={{ kind: "logo", src: `${LOGO_BASE}/X.hero.png` }}
        >
          <div
            style={{
              background: C.surface2,
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: C.text,
              maxWidth: "86%",
              border: `0.5px solid ${C.border}`,
              letterSpacing: "-0.1px",
            }}
          >
            Quick add - my CTO is curious about the embedding pipeline. Can
            we get him on the call too?
          </div>
        </Message>
      </div>

      <div
        className="relative"
        style={{
          borderTop: `0.5px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <div
          className="absolute"
          style={{
            right: 26,
            bottom: "calc(100% + 8px)",
            width: 230,
            background: C.surface,
            border: `0.5px solid ${C.borderStrong}`,
            borderRadius: 10,
            boxShadow:
              "0 12px 32px rgba(58, 46, 28, 0.14), 0 2px 6px rgba(58, 46, 28, 0.06)",
            padding: 5,
            zIndex: 10,
          }}
        >
          <div
            className="flex items-center gap-1.5"
            style={{
              padding: "6px 10px 8px",
              fontSize: 10,
              color: C.text3,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 700,
              borderBottom: `0.5px solid ${C.border}`,
              marginBottom: 4,
            }}
          >
            <BuddyMark size={14} />
            Buddy suggestions
            <span
              className="ml-auto"
              style={{ fontSize: 9, letterSpacing: "1px" }}
            >
              ⌘K
            </span>
          </div>
          {[
            { l: "Predict reply", k: "⌘1", icon: "+", active: true },
            { l: "Expand", k: "⌘2", icon: "↔" },
            { l: "Rephrase warmer", k: "⌘3", icon: "~" },
            { l: "Match my voice", k: "⌘4", icon: "A" },
          ].map((it) => (
            <div
              key={it.l}
              className="flex items-center"
              style={{
                gap: 10,
                padding: "7px 10px",
                fontSize: 12.5,
                color: it.active ? C.surface : C.text2,
                background: it.active ? C.brand : "transparent",
                borderRadius: 5,
                letterSpacing: "-0.1px",
                fontWeight: it.active ? 500 : 400,
              }}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded"
                style={{
                  background: it.active
                    ? "rgba(255,255,255,0.18)"
                    : C.surface3,
                  color: it.active ? C.surface : C.text3,
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: MONO,
                }}
              >
                {it.icon}
              </span>
              <span style={{ flex: 1 }}>{it.l}</span>
              <span
                className="ml-auto rounded"
                style={{
                  fontSize: 10,
                  color: it.active ? "rgba(255,255,255,0.9)" : C.text3,
                  fontFamily: MONO,
                  background: it.active
                    ? "rgba(255,255,255,0.18)"
                    : C.surface3,
                  padding: "1px 5px",
                  letterSpacing: "0.2px",
                }}
              >
                {it.k}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center"
          style={{
            gap: 2,
            padding: "8px 26px 0",
            borderBottom: `0.5px solid ${C.border}`,
          }}
        >
          {[
            { l: "Reply", active: true },
            { l: "Note" },
            { l: "Remind" },
            { l: "Shortcuts" },
          ].map((t) => (
            <div
              key={t.l}
              style={{
                padding: "9px 12px",
                fontSize: 12.5,
                color: t.active ? C.text : C.text3,
                borderBottom: `2px solid ${t.active ? C.brand : "transparent"}`,
                marginBottom: -1,
                fontWeight: t.active ? 600 : 500,
                letterSpacing: "-0.1px",
              }}
            >
              {t.l}
            </div>
          ))}
          <div
            className="ml-auto flex items-center"
            style={{
              gap: 6,
              padding: "9px 12px",
              fontSize: 12.5,
              color: C.accent,
              fontWeight: 600,
            }}
          >
            <BuddyMark size={14} />
            Buddy
          </div>
        </div>

        <div
          style={{
            padding: "16px 26px 12px",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: C.text,
            letterSpacing: "-0.1px",
          }}
        >
          Definitely - happy to walk through team rollout. I have 30 min
          Thursday or Friday, will send a calendar link. Bringing him along
          works perfectly - the embedding pipeline is the most fun part.
        </div>

        <div
          className="flex items-center"
          style={{
            gap: 4,
            padding: "8px 26px 14px",
            borderTop: `0.5px solid ${C.border}`,
          }}
        >
          {["@", "☺", "≡", "#"].map((s, i) => (
            <span
              key={i}
              className="grid place-items-center rounded"
              style={{
                width: 28,
                height: 28,
                color: C.text3,
                fontSize: 14,
                fontFamily: MONO,
              }}
            >
              {s}
            </span>
          ))}
          <span
            className="ml-1.5 flex items-center"
            style={{
              gap: 6,
              fontSize: 10.5,
              color: C.text3,
              letterSpacing: "-0.1px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <BuddyMark size={12} />
            drafted by Buddy · 0.4s
          </span>
          <button
            type="button"
            className="relative ml-auto flex items-center"
            style={{
              gap: 8,
              background: C.brand,
              color: C.surface,
              border: "none",
              padding: "7px 14px 7px 16px",
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: FONT,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
              letterSpacing: "-0.1px",
            }}
          >
            Send
            <span
              className="rounded"
              style={{
                fontSize: 10,
                opacity: 0.7,
                fontFamily: MONO,
                background: "rgba(255,255,255,0.14)",
                padding: "1px 5px",
                letterSpacing: "0.2px",
              }}
            >
              ⌘↵
            </span>
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes vm-mockup-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`,
        }}
      />
    </main>
  );
}

function ToolBtn({ label }: { label: string }) {
  return (
    <span
      className="grid place-items-center rounded"
      style={{
        width: 30,
        height: 30,
        color: C.text2,
        fontSize: 13,
        fontFamily: MONO,
      }}
    >
      {label}
    </span>
  );
}

function Dot() {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: 2, height: 2, background: C.text4 }}
    />
  );
}

interface MessageProps {
  who: string;
  when: string;
  av: { kind: Av; initials: string } | { kind: "logo"; src: string };
  out?: boolean;
  whoColor?: string;
  children: React.ReactNode;
}

function Message({ who, when, av, out, whoColor, children }: MessageProps) {
  return (
    <div
      className="flex"
      style={{
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 22,
        flexDirection: out ? "row-reverse" : "row",
      }}
    >
      {av.kind === "logo" ? (
        <span
          className="relative grid shrink-0 place-items-center overflow-hidden rounded-full"
          style={{
            width: 32,
            height: 32,
            background: C.surface,
            border: `0.5px solid ${C.border}`,
          }}
        >
          <Image
            src={av.src}
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
            unoptimized
          />
        </span>
      ) : (
        <span
          className="grid shrink-0 place-items-center rounded-full"
          style={{
            width: 32,
            height: 32,
            background: AVATAR_STYLES[av.kind].bg,
            color: AVATAR_STYLES[av.kind].color,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "-0.3px",
          }}
        >
          {av.initials}
        </span>
      )}
      <div
        className="min-w-0 flex-1"
        style={out ? { display: "flex", flexDirection: "column", alignItems: "flex-end" } : undefined}
      >
        <div
          className="mb-1 flex items-baseline"
          style={{
            gap: 8,
            flexDirection: out ? "row-reverse" : "row",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.2px",
              color: whoColor ?? C.text,
            }}
          >
            {who}
          </span>
          <span
            style={{
              fontSize: 10.5,
              color: C.text3,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.1px",
            }}
          >
            {when}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ContextRail() {
  return (
    <aside
      className="flex flex-col overflow-y-auto"
      style={{
        background: C.surface2,
        borderLeft: `0.5px solid ${C.border}`,
        padding: "18px 16px",
        gap: 12,
      }}
    >
      <div
        style={{
          background: C.surface,
          border: `0.5px solid ${C.borderStrong}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div className="mb-3.5 flex items-center" style={{ gap: 11 }}>
          <span
            className="relative grid shrink-0 place-items-center overflow-hidden rounded-full"
            style={{
              width: 42,
              height: 42,
              background: C.surface,
              border: `0.5px solid ${C.border}`,
            }}
          >
            <Image
              src={`${LOGO_BASE}/X.hero.png`}
              alt=""
              width={42}
              height={42}
              className="h-full w-full object-cover"
              unoptimized
            />
          </span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.3px",
                marginBottom: 2,
                color: C.text,
              }}
            >
              Samuel Lee
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.text3,
                fontFamily: MONO,
                letterSpacing: "-0.2px",
              }}
            >
              @samuel_lee · X DM
            </div>
          </div>
        </div>
        <div className="mb-3.5 flex flex-wrap items-center" style={{ gap: 6 }}>
          <span
            style={{
              fontSize: 10.5,
              padding: "2px 8px",
              background: C.surface3,
              color: C.text,
              borderRadius: 3,
              fontWeight: 500,
              letterSpacing: "-0.1px",
            }}
          >
            Stack Labs · Series B
          </span>
          <span style={{ color: C.text4, fontSize: 10 }}>·</span>
          <span
            style={{
              fontSize: 11,
              color: C.text2,
              letterSpacing: "-0.1px",
            }}
          >
            Brooklyn, NY
          </span>
        </div>
        <button
          type="button"
          className="relative w-full"
          style={{
            background: C.brand,
            color: C.surface,
            border: "none",
            padding: 8,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: FONT,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            letterSpacing: "-0.1px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          View full profile →
        </button>
      </div>

      <RailSection
        title="Thread context"
        right={
          <span
            className="flex items-center"
            style={{
              color: C.good,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "none",
              fontSize: 10.5,
              gap: 4,
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: 5, height: 5, background: C.good }}
            />
            Warm
          </span>
        }
      >
        <DataRow k="Last 12 threads">
          <span
            style={{
              color: C.accentText,
              background: C.accentSoft,
              padding: "1px 8px",
              borderRadius: 3,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Warm
          </span>
        </DataRow>
        <DataRow k="Voice match" v="Founder-direct" />
        <DataRow k="Avg reply time" v="8m" />
        <DataRow k="Topic" v="Inbound lead" last />
      </RailSection>

      <RailSection
        title="Calendar"
        right={
          <span
            style={{
              color: C.accentText,
              fontWeight: 600,
              letterSpacing: "0.3px",
              textTransform: "none",
              fontSize: 10.5,
            }}
          >
            0 conflicts
          </span>
        }
      >
        <div className="flex items-center" style={{ gap: 12, padding: "4px 0" }}>
          <div
            className="relative overflow-hidden"
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: C.surface2,
              color: C.text,
              border: `0.5px solid ${C.borderStrong}`,
            }}
          >
            <div
              className="absolute inset-x-0 top-0 flex items-center justify-center"
              style={{ height: 13, background: C.accent }}
            >
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: C.surface,
                  lineHeight: 1,
                }}
              >
                Tue
              </span>
            </div>
            <div
              className="absolute inset-x-0 flex items-center justify-center"
              style={{ top: 13, bottom: 0 }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                19
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                lineHeight: 1.3,
                letterSpacing: "-0.2px",
                color: C.text,
                marginBottom: 2,
              }}
            >
              Stack Labs · team intro call
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: C.text3,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.1px",
              }}
            >
              Thu · 11:00 - 11:30 AM PT · 30 min
            </div>
          </div>
        </div>
      </RailSection>

      <RailSection title="Topics & tags">
        <div className="flex flex-wrap" style={{ gap: 5 }}>
          {[
            { l: "x-dm", tone: "brand" as const },
            { l: "stack-labs", tone: "brand" as const },
            { l: "hot", tone: "hot" as const },
            { l: "customer:series-b", tone: "neutral" as const },
            { l: "priority", tone: "neutral" as const },
            { l: "demo", tone: "neutral" as const },
          ].map((t) => {
            const style =
              t.tone === "brand"
                ? { background: C.brandSoft, color: C.brandText }
                : t.tone === "hot"
                  ? { background: C.hotSoft, color: C.hotText }
                  : { background: C.surface3, color: C.text2 };
            return (
              <span
                key={t.l}
                style={{
                  fontSize: 10.5,
                  padding: "3px 8px",
                  borderRadius: 3,
                  fontWeight: 500,
                  fontFamily: MONO,
                  letterSpacing: "-0.2px",
                  ...style,
                }}
              >
                {t.l}
              </span>
            );
          })}
        </div>
      </RailSection>

      <RailSection
        title="Sender activity"
        right={
          <span
            style={{
              fontSize: 10,
              color: C.text3,
              textTransform: "none",
              letterSpacing: 0,
              fontWeight: 500,
            }}
          >
            last 7d
          </span>
        }
      >
        <div
          className="flex items-end"
          style={{ height: 36, gap: 3, marginTop: 6, marginBottom: 6 }}
        >
          {[
            { h: 30, o: 0.22, accent: false },
            { h: 50, o: 0.32, accent: false },
            { h: 40, o: 0.28, accent: false },
            { h: 70, o: 0.5, accent: false },
            { h: 55, o: 0.4, accent: false },
            { h: 85, o: 0.7, accent: false },
            { h: 100, o: 1, accent: true },
          ].map((b, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                background: b.accent ? C.accent : C.brand,
                opacity: b.o,
                height: `${b.h}%`,
              }}
            />
          ))}
        </div>
        <div
          className="flex justify-between"
          style={{
            fontSize: 9.5,
            color: C.text3,
            fontFamily: MONO,
            letterSpacing: "-0.1px",
            marginBottom: 8,
          }}
        >
          <span>May 11</span>
          <span>Today</span>
        </div>
        <DataRow k="First contact" v="Today" />
        <DataRow k="Threads" v="1" />
        <DataRow k="Their reply avg" v="8m" last />
      </RailSection>
    </aside>
  );
}

function RailSection({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.borderStrong}`,
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div
        className="mb-2.5 flex items-center justify-between"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: C.text3,
        }}
      >
        <span>{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function DataRow({
  k,
  v,
  last,
  children,
}: {
  k: string;
  v?: string;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "6px 0",
        borderBottom: last ? "none" : `0.5px dashed ${C.border}`,
        fontSize: 12,
        letterSpacing: "-0.1px",
      }}
    >
      <span style={{ color: C.text3 }}>{k}</span>
      {children ?? (
        <span
          style={{
            color: C.text,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {v}
        </span>
      )}
    </div>
  );
}
