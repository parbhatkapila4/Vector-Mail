"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const ambientLines = [
  "const query = embed(search);",
  "await db.$queryRaw('SELECT * FROM emails');",
  "semanticSearch({ accountId, limit: 10 });",
  "trpc.mail.search.query",
  "pgvector <=> embedding",
  "Email.embedding",
  "findByMeaning()",
  "AI summary · compose · reply",
  "VectorMail",
  "inbox · search · threads",
];

export function AIBanner() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative overflow-hidden py-28 md:py-40 mb-20 md:mb-28">

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #f5d4ed 0%, #edd8f0 12%, #e0dff5 28%, #d0e5f5 45%, #c2e0f5 62%, #b0daf2 78%, #9fd4f0 92%, #8eccee 100%)",
        }}
      />

      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 40%, rgba(255,255,255,0.25) 0%, transparent 55%)",
        }}
      />


      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -left-[5%] top-[-5%] h-[380px] w-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 35% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, transparent 75%)",
            filter: "blur(55px)",
            opacity: 0.9,
          }}
        />
        <div
          className="absolute left-[10%] top-[15%] h-[340px] w-[460px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 50%, transparent 75%)",
            filter: "blur(60px)",
            opacity: 0.88,
          }}
        />
        <div
          className="absolute left-[25%] top-[5%] h-[300px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,252,255,0.8) 0%, rgba(255,255,255,0.25) 50%, transparent 72%)",
            filter: "blur(58px)",
            opacity: 0.85,
          }}
        />
        <div
          className="absolute right-[-5%] top-[10%] h-[360px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 68% 58% at 55% 40%, rgba(255,255,255,0.9) 0%, rgba(248,252,255,0.5) 40%, transparent 72%)",
            filter: "blur(52px)",
            opacity: 0.9,
          }}
        />
        <div
          className="absolute right-[5%] top-[30%] h-[320px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 62% 62% at 50% 50%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.4) 48%, transparent 72%)",
            filter: "blur(55px)",
            opacity: 0.88,
          }}
        />
        <div
          className="absolute right-[0%] bottom-[10%] h-[280px] w-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 58% 62% at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(248,252,255,0.35) 50%, transparent 72%)",
            filter: "blur(50px)",
            opacity: 0.85,
          }}
        />
      </div>


      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ opacity: 0.2 }}
        aria-hidden
      >
        <div className="absolute inset-0 flex flex-wrap content-start gap-x-12 gap-y-5 px-6 py-10 font-mono text-[10px] leading-relaxed text-slate-600 md:gap-x-16 md:gap-y-6 md:text-[11px]">
          {ambientLines.flatMap((line, i) =>
            Array.from({ length: 8 }).map((_, j) => (
              <span key={`${i}-${j}`} className="whitespace-nowrap">
                {line}
              </span>
            ))
          )}
        </div>
      </div>
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ opacity: 0.15 }}
        aria-hidden
      >
        <div
          className="absolute inset-0 flex flex-wrap content-start gap-x-12 gap-y-5 px-6 py-10 font-mono text-[10px] leading-relaxed text-slate-600 md:gap-x-16 md:gap-y-6 md:text-[11px]"
          style={{ filter: "blur(3px)" }}
        >
          {ambientLines.flatMap((line, i) =>
            Array.from({ length: 6 }).map((_, j) => (
              <span key={`b2-${i}-${j}`} className="whitespace-nowrap">
                {line}
              </span>
            ))
          )}
        </div>
      </div>


      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none"
        style={{ opacity: 0.08 }}
        aria-hidden
      >
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-[15%] gap-y-16 px-8 py-12 font-sans text-[2rem] font-semibold tracking-tight text-slate-600 md:gap-[12%] md:text-[2.5rem] lg:text-[3rem]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap">
              {i % 3 === 0 ? "VectorMail" : i % 3 === 1 ? "AI" : "Search"}
            </span>
          ))}
        </div>
      </div>


      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, #0a0a0a 0%, transparent 18%, transparent 82%, #0a0a0a 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-center md:gap-12">
        <h2 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-[#0c0a12] sm:text-5xl md:text-5xl lg:text-6xl">
          Think it.
          <br />
          Say it.
          <br />
          Find it.
        </h2>
        <div className="shrink-0 md:pl-4">
          <Link
            href={isSignedIn ? "/mail" : "/sign-up"}
            className="inline-flex rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#0c0a12] shadow-lg shadow-black/10 transition-shadow hover:shadow-xl hover:shadow-black/15"
          >
            Get VectorMail
          </Link>
        </div>
      </div>
    </section>
  );
}
