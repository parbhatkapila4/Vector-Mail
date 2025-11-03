
import React from 'react'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { FeatureHighlight } from '@/components/landing/FeatureHighlight'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-black w-full overflow-x-hidden">
      <Navigation />
      <main className="overflow-hidden w-full">
        <Hero />
        <Features />
        <FeatureHighlight />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
