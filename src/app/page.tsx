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
import { Footer } from "@/components/landing/Footer";

function EmailMockup() {
  return (
    <div style={{ perspective: "2400px" }}>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_30px_100px_-25px_rgba(245,158,11,0.12)]"
        style={{ transform: "rotateX(2deg)", transformOrigin: "center top" }}
      >

        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#14120a]/80 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5">
              <svg
                className="h-3 w-3 text-white/25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-[12px] text-white/35">
                app.vectormail.ai
              </span>
            </div>
          </div>
          <div className="h-6 w-6 overflow-hidden rounded-md ring-1 ring-white/10">
            <video
              src="/Vectormail-logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-150 object-cover"
            />
          </div>
        </div>

        <div className="flex bg-[#0c0a08]">
          <div className="hidden w-[210px] flex-shrink-0 border-r border-white/[0.05] p-3 lg:block">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.06] px-3 py-2.5">
              <Search className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-[12px] font-medium text-yellow-300/80">
                AI Search
              </span>
            </div>
            {[
              {
                icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
                label: "Inbox",
                count: "12",
                active: true,
              },
              {
                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                label: "Starred",
                count: "3",
                active: false,
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                label: "Snoozed",
                count: "",
                active: false,
              },
              {
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                label: "Sent",
                count: "",
                active: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`mb-0.5 flex items-center justify-between rounded-lg px-3 py-2 ${item.active ? "bg-white/[0.05]" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <svg
                    className={`h-3.5 w-3.5 ${item.active ? "text-white/80" : "text-white/25"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  <span
                    className={`text-[12px] ${item.active ? "font-medium text-white/80" : "text-white/35"}`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.count && (
                  <span
                    className={`text-[10px] font-medium ${item.active ? "text-white/50" : "text-white/20"}`}
                  >
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="min-h-[400px] flex-1 sm:min-h-[460px]">
            <div className="border-b border-white/[0.05] p-4">
              <div className="flex items-center gap-3 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] px-4 py-3">
                <Search className="h-4 w-4 text-yellow-400/60" />
                <span className="flex-1 text-[13px] text-white/55">
                  &ldquo;Show me all emails from Sarah about the Q3 budget&rdquo;
                </span>
                <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2.5 py-1">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                  <span className="font-mono text-[10px] font-medium text-yellow-300/70">
                    47ms
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">
                  3 results found
                </span>
                <span className="text-[10px] text-white/15">
                  Sorted by relevance
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3.5 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] p-3.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-[12px] font-semibold text-[#1a1000]">
                    SC
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white/85">
                        Q3 Budget Contract — Final Version
                      </span>
                      <span className="hidden rounded-full border border-yellow-400/25 bg-yellow-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-yellow-300 sm:inline">
                        Best Match
                      </span>
                    </div>
                    <p className="text-[11px] text-white/30">
                      Sarah Chen · &ldquo;Attached is the final contract with
                      all revisions...&rdquo;
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[22px] font-bold leading-none text-yellow-400">
                      98%
                    </div>
                    <div className="text-[9px] text-white/25">match</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.04] p-3.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-[12px] font-semibold text-white">
                    SC
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-0.5 block text-[12px] font-medium text-white/60">
                      Re: Budget revision notes
                    </span>
                    <p className="text-[11px] text-white/25">
                      Sarah Chen · &ldquo;Here are my notes on the Q3 budget
                      changes...&rdquo;
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[22px] font-bold leading-none text-white/25">
                      84%
                    </div>
                    <div className="text-[9px] text-white/15">match</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.04] p-3.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-[12px] font-semibold text-white">
                    SC
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-0.5 block text-[12px] font-medium text-white/60">
                      Q3 Planning Discussion
                    </span>
                    <p className="text-[11px] text-white/25">
                      Sarah Chen · &ldquo;Let&apos;s schedule a call to discuss
                      the budget...&rdquo;
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[22px] font-bold leading-none text-white/18">
                      71%
                    </div>
                    <div className="text-[9px] text-white/15">match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden w-[250px] flex-shrink-0 border-l border-white/[0.05] p-4 xl:block">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-yellow-500">
                <Zap className="h-3 w-3 text-[#1a1000]" />
              </div>
              <span className="text-[12px] font-semibold text-white/80">
                AI Summary
              </span>
            </div>
            <div className="mb-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <p className="text-[11px] leading-relaxed text-white/50">
                Sarah sent the{" "}
                <span className="font-medium text-yellow-300/80">
                  final Q3 budget contract
                </span>{" "}
                on Oct 15. Key points:
              </p>
              <div className="mt-2.5 space-y-1.5">
                {[
                  "Budget increased by 20%",
                  "Deadline: November 15th",
                  "Requires your approval",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 rounded-full bg-yellow-400/60" />
                    <span className="text-[10px] text-white/35">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="mb-2 block text-[9px] font-medium uppercase tracking-wider text-white/20">
              Quick Actions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["Reply", "Forward", "Archive"].map((action, i) => (
                <button
                  key={i}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-white/30 transition-all hover:border-white/[0.1] hover:text-white/60"
                >
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0c0a12]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 20% 30%, hsla(38, 90%, 50%, 0.14) 0px, transparent 55%),
              radial-gradient(at 80% 20%, hsla(45, 95%, 55%, 0.1) 0px, transparent 50%),
              radial-gradient(at 50% 80%, hsla(30, 80%, 45%, 0.07) 0px, transparent 50%),
              radial-gradient(at 10% 80%, hsla(42, 90%, 50%, 0.05) 0px, transparent 45%)
            `,
          }}
        />
        <div className="hero-mesh-1 absolute -left-[10%] top-0 h-[800px] w-[800px] rounded-full bg-amber-500/15 blur-[150px]" />
        <div className="hero-mesh-2 absolute -right-[5%] top-[5%] h-[600px] w-[600px] rounded-full bg-yellow-500/12 blur-[130px]" />
        <div className="hero-mesh-3 absolute bottom-[10%] left-[15%] h-[500px] w-[500px] rounded-full bg-orange-500/8 blur-[120px]" />
        <div className="hero-mesh-4 absolute -bottom-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-amber-400/6 blur-[100px]" />

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
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="40%" stopColor="#d97706" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="1550" y1="30" x2="-150" y2="950" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="wave-grad-3" x1="1450" y1="-100" x2="-150" y2="830" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-28 pt-40 sm:pt-48 md:pt-52">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 mb-10 flex justify-center"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-5 py-2 backdrop-blur-2xl">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
            <span className="text-[13px] font-medium text-white/60">
              Introducing VectorMail 2.0
            </span>
          </div>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-[100%] max-w-[1100px]"
            >
              <EmailMockup />
            </motion.div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-[40%] z-[1] -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[300px] w-[700px] sm:h-[350px] sm:w-[900px]">
              <div className="hero-aurora-1 absolute -left-[10%] top-0 h-[250px] w-[400px] rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/35 to-amber-600/25 blur-[90px]" />
              <div className="hero-aurora-2 absolute -right-[5%] top-[10%] h-[220px] w-[350px] rounded-full bg-gradient-to-r from-yellow-300/35 via-amber-400/40 to-orange-500/25 blur-[80px]" />
              <div className="hero-aurora-3 absolute -bottom-[20%] left-[15%] h-[250px] w-[450px] rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-500/35 to-amber-300/20 blur-[100px]" />
            </div>
          </div>
          <div className="hero-rays pointer-events-none absolute left-1/2 top-[40%] z-[1] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 sm:h-[650px] sm:w-[650px] md:h-[800px] md:w-[800px]" />

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
                className="group flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0c0a12] shadow-lg shadow-black/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
              >
                Get VectorMail
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#000000] via-[#0c0a12]/80 to-transparent" />
    </section>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#000000]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[120px]" />
      </div>
      <Navigation />
      <main className="relative w-full overflow-hidden">
        <HeroSection />
        <Testimonials />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
