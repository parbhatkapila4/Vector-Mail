"use client";

import React, { Suspense } from "react";
import { Navigation } from "@/components/landing/Navigation";
import { HeroLight } from "@/components/landing/HeroLight";
import { PullQuote } from "@/components/landing/PullQuote";
import { CompressionEngine } from "@/components/landing/CompressionEngine";
import { Testimonials } from "@/components/landing/Testimonials";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benchmark } from "@/components/landing/Benchmark";
import { UseCases } from "@/components/landing/UseCases";
import { Enterprise } from "@/components/landing/Enterprise";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background: "var(--vmx-paper, #ffffff)",
        color: "var(--vmx-ink, #0a0a0a)",
        fontFamily: "var(--vmx-sans)",
      }}
    >
      <Suspense
        fallback={
          <header
            className="sticky top-0 z-50 h-[58px] border-b"
            style={{
              background: "rgba(255,255,255,0.8)",
              borderColor: "var(--vmx-line, #e5e0ee)",
            }}
          />
        }
      >
        <Navigation />
      </Suspense>
      <main className="relative w-full overflow-hidden">
        <HeroLight />
        <PullQuote />
        <CompressionEngine />
        <Testimonials />
        <HowItWorks />
        <Benchmark />
        <Suspense fallback={null}>
          <UseCases />
        </Suspense>
        <Enterprise />
        <section className="vmx-halftone relative">
          <FinalCTA />
          <Footer />
        </section>
      </main>
    </div>
  );
}
