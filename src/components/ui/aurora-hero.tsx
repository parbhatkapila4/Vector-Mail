"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PresetType =
  | "fade"
  | "slide"
  | "scale"
  | "blur"
  | "blur-slide"
  | "zoom"
  | "flip"
  | "bounce"
  | "rotate"
  | "swing";

type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(4px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
    },
  },
  "blur-slide": {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(4px)", y: 20 },
      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
    },
  },
  zoom: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  },
  flip: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotateX: -90 },
      visible: {
        opacity: 1,
        rotateX: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 20 },
      },
    },
  },
  bounce: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: -50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 400, damping: 10 },
      },
    },
  },
  rotate: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -180 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: "spring" as const, stiffness: 200, damping: 15 },
      },
    },
  },
  swing: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, rotate: -10 },
      visible: {
        opacity: 1,
        rotate: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 8 },
      },
    },
  },
};

function AnimatedGroup({
  children,
  className,
  variants,
  preset,
}: AnimatedGroupProps) {
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };
  const containerVariants = variants?.container ?? selectedVariants.container;
  const itemVariants = variants?.item ?? selectedVariants.item;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { AnimatedGroup };

interface AnimatedGradientBackgroundProps {
  startingGap?: number;
  Breathing?: boolean;
  gradientColors?: string[];
  gradientStops?: number[];
  animationSpeed?: number;
  breathingRange?: number;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  topOffset?: number;
}

const AnimatedGradientBackground: React.FC<
  AnimatedGradientBackgroundProps
> = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    "#0A0A0A",
    "#371C0B",
    "#683637",
    "#7B445C",
    "#194286",
    "#2366D5",
    "#0A0A0A",
  ],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
    if (gradientColors.length !== gradientStops.length) {
      throw new Error(
        `gradientColors and gradientStops must have the same length. Received ${gradientColors.length} and ${gradientStops.length}`
      );
    }

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      let animationFrame: number;
      let width = startingGap;
      let directionWidth = 1;

      const animateGradient = () => {
        if (width >= startingGap + breathingRange) directionWidth = -1;
        if (width <= startingGap - breathingRange) directionWidth = 1;
        if (!Breathing) directionWidth = 0;
        width += directionWidth * animationSpeed;

        const gradientStopsString = gradientStops
          .map((stop, index) => `${gradientColors[index]} ${stop}%`)
          .join(", ");
        const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

        if (containerRef.current) {
          containerRef.current.style.background = gradient;
        }
        animationFrame = requestAnimationFrame(animateGradient);
      };

      animationFrame = requestAnimationFrame(animateGradient);
      return () => cancelAnimationFrame(animationFrame);
    }, [
      startingGap,
      Breathing,
      gradientColors,
      gradientStops,
      animationSpeed,
      breathingRange,
      topOffset,
    ]);

    return (
      <motion.div
        key="animated-gradient-background"
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 2,
            ease: [0.25, 0.1, 0.25, 1],
          },
        }}
        className={cn("absolute inset-0 overflow-hidden", containerClassName)}
      >
        <div
          ref={containerRef}
          style={containerStyle}
          className="absolute inset-0 transition-transform"
        />
      </motion.div>
    );
  };

export default function HeroSection_04() {
  const transitionVariants = {
    item: {
      hidden: {
        opacity: 0,
        filter: "blur(12px)",
        y: 12,
      },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          type: "spring" as const,
          bounce: 0.3,
          duration: 1.5,
        },
      },
    },
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <AnimatedGradientBackground />
      <div className="relative pt-20 pb-6 sm:pt-24 sm:pb-8 text-center flex-1 flex flex-col justify-center">
        <div className="relative max-w-3xl mx-auto px-4">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-medium tracking-wide text-white/80 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Introducing VectorMail 2.0
          </motion.p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-white via-white to-white/90 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              Inbox reimagined
            </span>
            <br />
            <span
              className="bg-clip-text text-transparent text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                backgroundImage: "linear-gradient(to right, #c9a87c, #b8735c, #9a5c4a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              with AI
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-white/90 sm:text-lg sm:leading-relaxed">
            One place for mail, semantic search, and AI that helps you compose faster, find anything instantly, and stay in control. Built to ship.
          </p>
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.5,
                  },
                },
              },
            }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <div
              key="1"
              className="rounded-[14px] border border-white/15 bg-white/10 p-0.5 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-white/25"
            >
              <Button
                asChild
                size="lg"
                className="rounded-xl px-6 text-base font-semibold bg-white text-[#0c0a12] shadow-sm hover:bg-white/95"
              >
                <Link href="/sign-up">
                  <span className="text-nowrap">Get VectorMail</span>
                </Link>
              </Button>
            </div>
            <div
              key="2"
              className="rounded-[14px] border border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 p-0.5 shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
            >
              <Button
                asChild
                size="lg"
                className="rounded-xl px-6 text-base font-semibold bg-white text-[#0c0a12] hover:bg-white/95 hover:text-[#0c0a12]"
              >
                <a
                  href="mailto:parbhat@parbhat.dev?subject=Request%20access%20-%20VectorMail"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-nowrap">Request access</span>
                </a>
              </Button>
            </div>
          </AnimatedGroup>
        </div>
      </div>
      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.4,
              },
            },
          },
          ...transitionVariants,
        }}
      >
        <div className="relative mt-8 overflow-hidden px-4 sm:mt-12 sm:px-6 pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent from-30% to-[#0a0a0a]"
          />
          <div className="relative mx-auto w-full max-w-[280px] md:hidden">
            <div className="overflow-hidden rounded-[2.75rem] border-[10px] border-[#1c1c1e] bg-[#1c1c1e] shadow-[0_0_0_2px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex aspect-[9/19.5] min-h-[460px] flex-col rounded-[2rem] bg-[#0a0a0a] ring-1 ring-white/5 overflow-hidden">
                <div className="shrink-0 flex justify-center pt-3 pb-1">
                  <div className="h-7 w-[100px] rounded-full bg-black" aria-hidden />
                </div>
                <div className="shrink-0 border-b border-white/10 px-4 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                      <Image
                        src="/VectorMail-New.png"
                        alt=""
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-white">Inbox</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto border-t border-white/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="border-b border-white/10 px-3 py-2">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white/50">Q Search</div>
                  </div>
                  <div className="space-y-0.5 p-2">
                    {[
                      { from: "William Smith", subj: "Meeting Tomorrow: Q4 roadmap", time: "2h ago" },
                      { from: "Alice Smith", subj: "Re: Project Update & design review", time: "5h ago" },
                      { from: "Bob Johnson", subj: "Weekend Plans: dinner Saturday?", time: "1d ago" },
                      { from: "Emily Davis", subj: "Re: Budget & timeline follow-up", time: "2d ago" },
                      { from: "Sarah Chen", subj: "VectorMail feedback: search & AI", time: "3d ago" },
                      { from: "Marcus Reid", subj: "Invoice #4821: payment confirmation", time: "1w ago" },
                      { from: "Jessica Park", subj: "Design system review: components", time: "1w ago" },
                      { from: "David Kim", subj: "Sprint planning: capacity check", time: "1w ago" },
                      { from: "Rachel Green", subj: "Re: Vendor contract renewal", time: "2w ago" },
                      { from: "Tom Wilson", subj: "Quick sync: launch checklist", time: "2w ago" },
                    ].map((mail, i) => (
                      <div
                        key={`${mail.from}-${i}`}
                        className={`rounded-lg px-2.5 py-2 ${i === 0 ? "bg-white/10 ring-1 ring-white/20" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white truncate min-w-0">{mail.from}</span>
                          <span className="text-[10px] text-white/50 shrink-0 ml-1">{mail.time}</span>
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-white/70">{mail.subj}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 border-t border-white/10 p-3">
                  <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-white/50">Reply...</div>
                  <button type="button" className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-xs font-medium text-white">Send</button>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mx-auto max-w-7xl w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/95 p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_80px_-20px_rgba(59,130,246,0.15)] backdrop-blur-sm sm:p-2 hidden md:block">
            <div className="flex aspect-[15/8] w-full rounded-xl bg-[#0a0a0a] ring-1 ring-white/5">
              <aside className="flex w-[200px] shrink-0 flex-col border-r border-white/10 bg-[#0f0f0f] py-3">
                <div className="flex items-center gap-2 px-3">
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded">
                    <Image
                      src="/VectorMail-New.png"
                      alt="VectorMail"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-white/60">You</span>
                </div>
                <nav className="mt-3 space-y-0.5 px-2 text-sm">
                  {["Inbox", "Drafts", "Sent", "Junk", "Trash", "Archive"].map((folder, i) => (
                    <div
                      key={folder}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 ${i === 0 ? "bg-white/10 text-white" : "text-white/70"}`}
                    >
                      <span>{folder}</span>
                      {i === 0 && <span className="text-[10px] text-white/60">128</span>}
                    </div>
                  ))}
                </nav>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <div className="px-2 text-[10px] font-medium uppercase tracking-wider text-white/50">Categories</div>
                  {["Social", "Updates", "Forums", "Shopping", "Promotions"].map((cat, i) => (
                    <div key={cat} className="mt-1 flex items-center justify-between px-2 py-1 text-xs text-white/70">
                      <span>{cat}</span>
                      <span className="text-[10px] text-white/50">{[972, 342, 128, 8, 21][i]}</span>
                    </div>
                  ))}
                </div>
              </aside>
              <div className="flex min-w-0 flex-1 flex-col border-r border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span className="text-sm font-medium text-white">Inbox</span>
                  <div className="flex gap-1">
                    <button type="button" className="rounded px-2 py-1 text-xs text-white/80">All mail</button>
                    <button type="button" className="rounded px-2 py-1 text-xs text-white/50">Unread</button>
                  </div>
                </div>
                <div className="border-b border-white/10 px-3 py-2">
                  <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/50">Q Search</div>
                </div>
                <div className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { from: "William Smith", subj: "Meeting Tomorrow: Q4 roadmap and sync", snip: "Let's sync on the project timeline and align on the Q4 roadmap. I've attached the draft deck and would love your feedback before we share with the team.", tags: ["meeting", "work", "important"], time: "2h ago" },
                    { from: "Alice Smith", subj: "Re: Project Update & design review", snip: "Here are the latest changes from the design sprint. The new components are in Figma and the API docs have been updated. Can you review by EOD?", tags: ["work", "design"], time: "5h ago" },
                    { from: "Bob Johnson", subj: "Weekend Plans: dinner Saturday?", snip: "Are we still on for Saturday? I booked a table at 7. Let me know if you need to push or bring a plus-one.", tags: ["personal"], time: "1d ago" },
                    { from: "Emily Davis", subj: "Re: Question about Budget & timeline", snip: "Thanks for sending the breakdown. I have a few follow-ups on the engineering allocation and whether we can pull the launch forward by two weeks.", tags: ["budget", "work"], time: "2d ago" },
                    { from: "Sarah Chen", subj: "VectorMail feedback: search & AI", snip: "The new semantic search is incredible. One small request: could we add filters for date range and label in the AI summary view? That would make my workflow so much faster.", tags: ["feedback", "product"], time: "3d ago" },
                    { from: "Marcus Reid", subj: "Invoice #4821: payment confirmation", snip: "Your payment has been processed. Receipt and updated subscription details are attached. Renewal is set for next month.", tags: ["billing", "updates"], time: "1w ago" },
                  ].map((mail, i) => (
                    <div
                      key={`${mail.from}-${mail.subj}`}
                      className={`rounded-md px-2 py-1.5 ${i === 0 ? "bg-white/10 ring-1 ring-white/20" : ""}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{mail.from}</span>
                        <span className="shrink-0 text-[10px] text-white/50">{mail.time}</span>
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-white/90">{mail.subj}</div>
                      <div className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-white/60">{mail.snip}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {mail.tags.map((tag) => (
                          <span key={tag} className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex w-[52%] min-w-0 shrink-0 flex-col bg-[#0a0a0a]">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  {["delete", "archive", "reply", "forward"].map((a) => (
                    <span key={a} className="h-2 w-2 rounded-full bg-white/30" aria-hidden />
                  ))}
                </div>
                <div className="flex-1 overflow-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30 text-xs font-medium text-white">WS</div>
                    <div>
                      <div className="text-sm font-medium text-white">William Smith</div>
                      <div className="text-[11px] text-white/50">Meeting Tomorrow</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-white/50">Reply-To: williamsmith@example.com · March 2026</div>
                  <div className="mt-3 space-y-3 text-xs leading-relaxed text-white/80">
                    <p>
                      Quick sync tomorrow works. Before we get into the roadmap, one thing that's made a real difference for our team: we moved to VectorMail and I'd recommend you try it if you haven't.
                    </p>
                    <p>
                      Inbox stays in one place but search actually works. You can ask in plain language ("everything from Sarah about the Q3 budget" or "that thread where we discussed the launch date") and get the right threads in one shot. No more scrolling or guessing keywords. Compose is fast too: drafts and sends feel instant, and you stay in control of what goes out.
                    </p>
                    <p>
                      The AI doesn't try to do your job for you. It surfaces what matters, summarizes when you need it, and gets out of the way. For anyone drowning in email, it's the first thing that's felt built for how we actually work. Worth a look before we lock the Q4 plan.
                    </p>
                    <p>
                      Bring any questions tomorrow. Looking forward to it.
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 p-3">
                  <div className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-white/50">Reply William Smith...</div>
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[10px] text-white/60">
                      <span className="h-3 w-3 rounded border border-white/30 bg-transparent" /> Mute this thread
                    </label>
                    <button type="button" className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedGroup>
    </div>
  );
}
