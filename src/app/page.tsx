"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Search, Zap } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Testimonials } from "@/components/landing/Testimonials";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { AIBanner } from "@/components/landing/AIBanner";
import { Footer } from "@/components/landing/Footer";

function EmailMockup() {
  return (
    <div style={{ perspective: "2400px" }}>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-12px_rgba(0,0,0,0.6),0_40px_120px_-24px_rgba(0,0,0,0.4)]"
        style={{ transform: "rotateX(2deg)", transformOrigin: "center top" }}
      >

        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-5 py-3.5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-[#141414] px-3.5 py-1.5">
              <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] tracking-wide text-gray-500">app.vectormail.ai</span>
            </div>
          </div>
          <div className="h-5 w-5 overflow-hidden rounded ring-1 ring-white/[0.06]">
            <video src="/Vectormail-logo.mp4" autoPlay loop muted playsInline className="h-full w-full scale-150 object-cover" />
          </div>
        </div>

        <div className="flex bg-[#0a0a0a]">

          <div className="hidden w-[200px] flex-shrink-0 border-r border-white/[0.04] bg-[#080808] py-4 pl-3 pr-2 lg:block">
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-[#0d0d0d] px-3 py-2.5">
              <Search className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-[11px] font-medium tracking-wide text-gray-400">AI Search</span>
            </div>
            <nav className="space-y-0.5">
              {[
                { icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4", label: "Inbox", count: "12", active: true },
                { icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", label: "Starred", count: "3", active: false },
                { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "Snoozed", count: "2", active: false },
                { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Sent", count: "", active: false },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Drafts", count: "2", active: false },
                { icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", label: "Trash", count: "", active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-md px-3 py-2 ${item.active ? "border-l-2 border-sky-500/80 bg-sky-500/[0.06] pl-2.5" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className={`h-3.5 w-3.5 ${item.active ? "text-sky-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={`text-[11px] tracking-wide ${item.active ? "font-medium text-sky-300" : "text-gray-400"}`}>{item.label}</span>
                  </div>
                  {item.count && <span className={`text-[10px] tabular-nums ${item.active ? "text-gray-400" : "text-gray-600"}`}>{item.count}</span>}
                </div>
              ))}
            </nav>
          </div>


          <div className="min-h-[480px] flex-1 sm:min-h-[560px] md:min-h-[620px] border-l border-white/[0.03] bg-[#0a0a0a]">
            <div className="border-b border-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0d0d0d] px-4 py-3 shadow-inner">
                <Search className="h-4 w-4 shrink-0 text-gray-500" />
                <span className="min-w-0 flex-1 truncate text-[12px] leading-snug text-gray-300">&ldquo;Show me all emails from Sarah about the Q3 budget&rdquo;</span>
                <span className="font-mono text-[10px] tabular-nums text-gray-600">47ms</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded border border-white/[0.05] bg-white/[0.03] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-gray-500">From: Sarah Chen</span>
                <span className="rounded border border-white/[0.05] bg-white/[0.03] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-gray-500">This week</span>
              </div>
              <div className="mb-3 flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-600">6 results found</span>
                <span className="text-[10px] text-gray-600">Sorted by relevance</span>
              </div>
              <div className="space-y-0">

                <div className="group flex items-start gap-4 border-l-2 border-sky-500/70 bg-white/[0.03] py-3.5 pl-4 pr-4 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-[#141414] text-[11px] font-semibold tabular-nums text-gray-300 ring-1 ring-white/[0.04]">SC</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-semibold leading-tight text-white">Q3 Budget Contract — Final Version</span>
                      <span className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-gray-400">Best Match</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-500">Sarah Chen · Oct 15 · &ldquo;Attached is the final contract with all revisions...&rdquo;</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[20px] font-bold tabular-nums leading-none text-gray-300">98%</div>
                    <div className="text-[9px] text-gray-600">match</div>
                  </div>
                </div>

                {[
                  { initials: "SC", subject: "Re: Budget revision notes", snippet: "Sarah Chen · Oct 14 · &ldquo;Here are my notes on the Q3 budget changes...&rdquo;", pct: "84%" },
                  { initials: "SC", subject: "Q3 Planning Discussion", snippet: "Sarah Chen · Oct 12 · &ldquo;Let's schedule a call to discuss the budget...&rdquo;", pct: "71%" },
                  { initials: "MK", subject: "Re: Q3 Budget Contract — Final Version", snippet: "Mike Kim · Oct 15 · &ldquo;Thanks Sarah, reviewing now...&rdquo;", pct: "62%" },
                  { initials: "JL", subject: "Fwd: Q3 budget summary deck", snippet: "Sarah Chen · Oct 11 · &ldquo;Sharing the deck for the meeting...&rdquo;", pct: "58%" },
                  { initials: "SC", subject: "Action required: Q3 Budget sign-off", snippet: "Sarah Chen · Oct 10 · &ldquo;Please review and approve by Friday...&rdquo;", pct: "51%" },
                ].map((row, i) => (
                  <div key={i} className="group flex items-start gap-4 border-l-2 border-transparent py-3.5 pl-4 pr-4 hover:bg-white/[0.02]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.04] bg-[#111111] text-[11px] font-semibold text-gray-400 ring-1 ring-white/[0.02]">{row.initials}</div>
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 block text-[12px] font-medium leading-tight text-gray-300">{row.subject}</span>
                      <p className="text-[11px] leading-relaxed text-gray-500">{row.snippet}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[20px] font-bold tabular-nums leading-none text-gray-500">{row.pct}</div>
                      <div className="text-[9px] text-gray-600">match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


          <div className="hidden w-[240px] flex-shrink-0 border-l border-white/[0.04] bg-[#080808] p-4 xl:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.05] bg-[#0d0d0d]">
                <Zap className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">AI Summary</span>
            </div>
            <div className="mb-4 rounded-xl border border-white/[0.04] bg-[#0d0d0d] p-4">
              <p className="text-[11px] leading-relaxed text-gray-400">
                Sarah sent the <span className="font-medium text-gray-300">final Q3 budget contract</span> on Oct 15. Key points:
              </p>
              <ul className="mt-3 space-y-2 border-t border-white/[0.04] pt-3">
                {["Budget increased by 20%", "Deadline: November 15th", "Requires your approval", "CC: Finance & Legal", "Attachment: contract_v3.pdf"].map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4 rounded-xl border border-white/[0.04] bg-[#0d0d0d] p-3.5">
              <span className="text-[9px] font-medium uppercase tracking-widest text-gray-600">Next steps</span>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-400">Reply to confirm approval or request changes. Thread has 4 participants.</p>
            </div>
            <span className="mb-2 block text-[9px] font-medium uppercase tracking-widest text-gray-600">Quick Actions</span>
            <div className="flex flex-wrap gap-2">
              {["Reply", "Forward", "Archive", "Snooze", "Schedule"].map((action, i) => (
                <button key={i} className="rounded-lg border border-white/[0.05] bg-[#0d0d0d] px-3 py-2 text-[10px] font-medium text-gray-400 transition-colors hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-gray-300">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.02) 0px, transparent 70%)
            `,
          }}
        />
        <div className="hero-mesh-1 absolute -left-[10%] top-0 h-[800px] w-[800px] rounded-full blur-[150px] opacity-0" aria-hidden />
        <div className="hero-mesh-2 absolute -right-[5%] top-[5%] h-[600px] w-[600px] rounded-full blur-[130px] opacity-0" aria-hidden />
        <div className="hero-mesh-3 absolute bottom-[10%] left-[15%] h-[500px] w-[500px] rounded-full blur-[120px] opacity-0" aria-hidden />
        <div className="hero-mesh-4 absolute -bottom-[10%] right-[5%] h-[500px] w-[500px] rounded-full blur-[100px] opacity-0" aria-hidden />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1500,-50 C1300,80 1100,200 900,280 C700,360 500,400 300,500 C100,600 -50,720 -100,900"
            stroke="url(#wave-grad-1)"
            strokeWidth="120"
            strokeLinecap="round"
            opacity="0.13"
          >
            <animate
              attributeName="d"
              dur="14s"
              repeatCount="indefinite"
              values="
                M1500,-50 C1300,80 1100,200 900,280 C700,360 500,400 300,500 C100,600 -50,720 -100,900;
                M1500,-50 C1280,120 1120,160 900,310 C680,400 520,360 300,530 C80,640 -30,680 -100,900;
                M1500,-50 C1320,50 1080,240 900,250 C720,320 480,440 300,470 C120,560 -70,760 -100,900;
                M1500,-50 C1260,100 1140,180 900,300 C660,380 540,380 300,510 C60,620 -40,740 -100,900;
                M1500,-50 C1300,80 1100,200 900,280 C700,360 500,400 300,500 C100,600 -50,720 -100,900
              "
            />
          </path>
          <path
            d="M1550,30 C1320,150 1080,270 850,350 C620,430 420,480 220,580 C20,680 -80,780 -150,950"
            stroke="url(#wave-grad-2)"
            strokeWidth="80"
            strokeLinecap="round"
            opacity="0.09"
          >
            <animate
              attributeName="d"
              dur="18s"
              repeatCount="indefinite"
              values="
                M1550,30 C1320,150 1080,270 850,350 C620,430 420,480 220,580 C20,680 -80,780 -150,950;
                M1550,30 C1340,110 1060,310 850,320 C640,390 400,520 220,550 C40,640 -60,820 -150,950;
                M1550,30 C1300,180 1100,230 850,380 C600,470 440,450 220,610 C0,720 -100,760 -150,950;
                M1550,30 C1360,130 1060,290 850,340 C620,410 420,500 220,570 C20,660 -80,800 -150,950;
                M1550,30 C1320,150 1080,270 850,350 C620,430 420,480 220,580 C20,680 -80,780 -150,950
              "
            />
          </path>
          <path
            d="M1450,-100 C1250,20 1020,140 800,220 C580,300 380,350 180,450 C-20,550 -100,660 -150,830"
            stroke="url(#wave-grad-3)"
            strokeWidth="50"
            strokeLinecap="round"
            opacity="0.16"
          >
            <animate
              attributeName="d"
              dur="16s"
              repeatCount="indefinite"
              values="
                M1450,-100 C1250,20 1020,140 800,220 C580,300 380,350 180,450 C-20,550 -100,660 -150,830;
                M1450,-100 C1230,60 1040,100 800,250 C560,340 400,310 180,480 C-40,590 -80,620 -150,830;
                M1450,-100 C1270,-10 1000,180 800,190 C600,260 360,390 180,420 C0,510 -120,700 -150,830;
                M1450,-100 C1240,40 1050,120 800,240 C570,320 390,330 180,460 C-30,570 -90,640 -150,830;
                M1450,-100 C1250,20 1020,140 800,220 C580,300 380,350 180,450 C-20,550 -100,660 -150,830
              "
            />
          </path>
          <defs>
            <linearGradient id="wave-grad-1" x1="1500" y1="-50" x2="-100" y2="900" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B22234" />
              <stop offset="33%" stopColor="#FFFFFF" />
              <stop offset="66%" stopColor="#002868" />
              <stop offset="100%" stopColor="#B22234" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="1550" y1="30" x2="-150" y2="950" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#002868" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B22234" />
            </linearGradient>
            <linearGradient id="wave-grad-3" x1="1450" y1="-100" x2="-150" y2="830" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#002868" />
              <stop offset="100%" stopColor="#B22234" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 mb-10 flex justify-center"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-5 py-2 backdrop-blur-2xl">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: "#BDBF09" }} />
            <span className="text-[13px] font-medium text-white/60">
              Introducing VectorMail 2.0
            </span>
          </div>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.38 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-[100%] max-w-[100vw] px-2 sm:max-w-[1400px] md:max-w-[1520px] lg:max-w-[1600px]"
            >
              <EmailMockup />
            </motion.div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-[40%] z-[1] -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[300px] w-[700px] sm:h-[350px] sm:w-[900px]">
              <div className="hero-aurora-1 absolute -left-[10%] top-0 h-[250px] w-[400px] rounded-full blur-[90px] opacity-0" aria-hidden />
              <div className="hero-aurora-2 absolute -right-[5%] top-[10%] h-[220px] w-[350px] rounded-full blur-[80px] opacity-0" aria-hidden />
              <div className="hero-aurora-3 absolute -bottom-[20%] left-[15%] h-[250px] w-[450px] rounded-full blur-[100px] opacity-0" aria-hidden />
            </div>
          </div>
          <div className="hero-rays pointer-events-none absolute left-1/2 top-[40%] z-[1] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.03] sm:h-[650px] sm:w-[650px] md:h-[800px] md:w-[800px]" />

          <div className="relative z-10 flex flex-col items-center bg-transparent">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display-serif mx-auto max-w-[820px] text-center text-[3rem] font-normal leading-[1.1] tracking-[-0.01em] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.7)] sm:text-[3.8rem] md:text-[4.8rem] lg:text-[5.5rem]"
            >
              Your inbox,
              <br />
              reimagined with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mx-auto mt-7 max-w-[480px] text-center text-[1.05rem] leading-[1.7] text-white/50 drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] md:text-[1.15rem]"
            >
              Mail, Search, and AI that works in every conversation
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-9"
            >
              <Link
                href={isSignedIn ? "/mail" : "/sign-up"}
                className="group flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0c0a12] shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(189,191,9,0.35)]"
              >
                Get VectorMail
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
    </section>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-[150px] opacity-0" aria-hidden />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full blur-[120px] opacity-0" aria-hidden />
      </div>
      <Navigation />
      <main className="relative w-full overflow-hidden">
        <HeroSection />
        <Testimonials />
        <Features />
        <AIBanner />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
