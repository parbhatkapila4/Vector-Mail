
import React from 'react'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { FeatureHighlight } from '@/components/landing/FeatureHighlight'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { SimpleContent } from '@/components/landing/SimpleContent'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <FeatureHighlight />
        <ProductShowcase />
        <SimpleContent />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}