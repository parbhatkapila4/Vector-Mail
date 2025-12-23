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
      <Navigation />
      <main className="w-full overflow-hidden">
        <Hero />
        <Testimonials />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
