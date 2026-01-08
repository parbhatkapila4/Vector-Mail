"use client";

import React from "react";
import { Navigation } from "@/components/landing/Navigation";
import { Testimonials } from "@/components/landing/Testimonials";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[#000000]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 right-0 top-0 w-[280px] md:w-[320px] lg:w-[380px]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 380 1000"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tornGradient" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#9A3412" />
              <stop offset="40%" stopColor="#C2410C" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
          <path
            d="M120,0 L380,0 L380,1000 L100,1000 
               Q115,985 105,970 Q120,955 100,940 Q118,925 102,910 Q122,895 98,880 
               Q115,865 103,850 Q120,835 100,820 Q118,805 102,790 Q122,775 98,760
               Q115,745 103,730 Q120,715 100,700 Q118,685 102,670 Q122,655 98,640
               Q115,625 103,610 Q120,595 100,580 Q118,565 102,550 Q122,535 98,520
               Q115,505 103,490 Q120,475 100,460 Q118,445 102,430 Q122,415 98,400
               Q115,385 103,370 Q120,355 100,340 Q118,325 102,310 Q122,295 98,280
               Q115,265 103,250 Q120,235 100,220 Q118,205 102,190 Q122,175 98,160
               Q115,145 103,130 Q120,115 100,100 Q118,85 102,70 Q122,55 98,40
               Q115,25 108,10 Q115,0 120,0 Z"
            fill="url(#tornGradient)"
          />
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col justify-center px-6 pb-16 pt-28">
        <div className="mb-8 inline-flex items-center self-start">
          <div className="flex items-center border-l-4 border-l-orange-500 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-4 py-3">
              <span className="text-[8px] uppercase leading-tight tracking-[0.15em] text-zinc-500">
                Search Latency
              </span>
              <div className="flex items-baseline">
                <span
                  className="text-[42px] font-black leading-none text-white"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  50
                </span>
                <span
                  className="text-[28px] font-black leading-none text-orange-500"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  ms
                </span>
              </div>
              <span className="text-[8px] uppercase leading-tight tracking-[0.12em] text-zinc-500">
                Vector Search
                <br />
                Powered By AI
              </span>
            </div>
          </div>
        </div>

        <h1
          className="text-[3.2rem] font-black uppercase leading-[0.88] tracking-tight text-white sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] xl:text-[8.5rem]"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}
        >
          Email That
          <br />
          Works
          <br />
          For You
          <br />
          Find Anything
          <br />
          Instantly
        </h1>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#000000]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
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
