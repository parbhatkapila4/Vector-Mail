"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative min-h-screen">
      <div className="relative mx-auto max-w-[1400px] px-8 pb-24 pt-32">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[13px] font-medium text-amber-200/90">
              Introducing VectorMail 2.0
            </span>
          </div>
        </div>

        <div className="relative mb-10 text-center">
          <div className="pointer-events-none absolute inset-0 -mx-8 overflow-hidden">
            <BackgroundBeamsWithCollision className="h-full w-full bg-transparent !from-transparent !to-transparent">
              <div></div>
            </BackgroundBeamsWithCollision>
          </div>
          <h1 className="relative z-20 text-[4rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[5.5rem] md:text-[7rem]">
            Email that works
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                for you
              </span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 5.5C30 2 60 2 100 4C140 6 170 5 199 3"
                  stroke="url(#underline-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="underline-gradient"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="relative z-20 mx-auto mt-8 max-w-[600px] text-[1.25rem] leading-[1.6] text-[#8B8B8D]">
            AI-powered email that understands context, not just keywords. Find
            anything instantly. Reply in seconds.
          </p>

          <div className="relative z-20 mt-10 flex justify-center">
            <Link
              href={isSignedIn ? "/mail" : "/sign-up"}
              className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[16px] font-semibold text-[#0A0A0B] transition-all hover:bg-white/90"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="relative mt-20">
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-b from-amber-500/20 via-transparent to-violet-500/10 opacity-40 blur-3xl" />

          <div className="relative rounded-[32px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-[1px] backdrop-blur-xl">
            <div className="overflow-hidden rounded-[31px] bg-[#0C0C0D]">
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0A0A0A] px-6 py-4">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                    <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-1.5">
                    <svg
                      className="h-3.5 w-3.5 text-zinc-500"
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
                    <span className="text-[13px] font-medium text-zinc-400">
                      app.vectormail.ai
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 overflow-hidden rounded-lg ring-1 ring-white/10">
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
              </div>

              <div className="flex">
                <div className="hidden w-[240px] border-r border-white/[0.06] bg-[#0A0A0A] p-4 lg:block">
                  <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-3 py-2.5">
                    <svg
                      className="h-4 w-4 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="text-[13px] font-medium text-amber-300/90">
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
                      label: "Priority",
                      count: "3",
                    },
                    {
                      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                      label: "Snoozed",
                      count: "",
                    },
                    {
                      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                      label: "Sent",
                      count: "",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`mb-1 flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${item.active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`h-4 w-4 ${item.active ? "text-white" : "text-zinc-500"}`}
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
                          className={`text-[13px] ${item.active ? "font-medium text-white" : "text-zinc-400"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.count && (
                        <span
                          className={`text-[11px] font-medium ${item.active ? "text-white" : "text-zinc-500"}`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="min-h-[480px] flex-1">
                  <div className="border-b border-white/[0.06] p-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                      <div className="relative flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.08] to-orange-500/[0.04] px-5 py-4">
                        <svg
                          className="h-5 w-5 text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <span className="flex-1 text-[15px] text-white">
                          &ldquo;Show me all emails from Sarah about the Q3
                          budget&rdquo;
                        </span>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                          <span className="font-mono text-[12px] font-medium text-amber-300">
                            47ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[12px] font-medium uppercase tracking-wider text-zinc-500">
                        3 results found
                      </span>
                      <span className="text-[12px] text-zinc-600">
                        Sorted by relevance
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="group relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="relative flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-transparent p-4 transition-colors hover:border-amber-500/30">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[14px] font-semibold text-white">
                            SC
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-white">
                                Q3 Budget Contract - Final Version
                              </span>
                              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                                Best Match
                              </span>
                            </div>
                            <p className="text-[13px] text-zinc-400">
                              Sarah Chen · &ldquo;Attached is the final contract
                              with all revisions...&rdquo;
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-[28px] font-bold leading-none text-amber-400">
                              98%
                            </div>
                            <div className="mt-0.5 text-[11px] text-zinc-500">
                              match
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.02]">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-[14px] font-semibold text-white">
                          SC
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="mb-0.5 block text-[14px] font-medium text-zinc-200">
                            Re: Budget revision notes
                          </span>
                          <p className="text-[13px] text-zinc-500">
                            Sarah Chen · &ldquo;Here are my notes on the Q3
                            budget changes...&rdquo;
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-[28px] font-bold leading-none text-zinc-500">
                            84%
                          </div>
                          <div className="mt-0.5 text-[11px] text-zinc-600">
                            match
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.02]">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-[14px] font-semibold text-white">
                          SC
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="mb-0.5 block text-[14px] font-medium text-zinc-200">
                            Q3 Planning Discussion
                          </span>
                          <p className="text-[13px] text-zinc-500">
                            Sarah Chen · &ldquo;Let&apos;s schedule a call to
                            discuss the budget...&rdquo;
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-[28px] font-bold leading-none text-zinc-600">
                            71%
                          </div>
                          <div className="mt-0.5 text-[11px] text-zinc-600">
                            match
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden w-[280px] border-l border-white/[0.06] bg-[#0A0A0A] p-5 xl:block">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-[13px] font-semibold text-white">
                      AI Summary
                    </span>
                  </div>

                  <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="text-[13px] leading-relaxed text-zinc-300">
                      Sarah sent the{" "}
                      <span className="font-medium text-amber-400">
                        final Q3 budget contract
                      </span>{" "}
                      on Oct 15. Key points:
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        "Budget increased by 20%",
                        "Deadline: November 15th",
                        "Requires your approval",
                      ].map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400" />
                          <span className="text-[12px] text-zinc-400">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Quick Actions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["Reply", "Forward", "Archive"].map((action, i) => (
                        <button
                          key={i}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Smart Reply
                    </span>
                    <div className="space-y-2">
                      {[
                        "Looks good, approved!",
                        "Let me review and get back",
                        "Can we discuss this?",
                      ].map((reply, i) => (
                        <button
                          key={i}
                          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left text-[12px] text-zinc-400 transition-all hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
