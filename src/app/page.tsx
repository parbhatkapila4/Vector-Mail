import React from "react";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#000000]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>
      <Navigation />
      <main className="relative w-full overflow-hidden">
        <Hero />
        <Testimonials />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
