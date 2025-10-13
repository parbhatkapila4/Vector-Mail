
import React from 'react'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { ScrollProgress } from '@/components/landing/ScrollProgress'
import { FloatingElements } from '@/components/landing/FloatingElements'
import { Features } from '@/components/landing/Features'
import { SimpleContent } from '@/components/landing/SimpleContent'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-black">
      <ScrollProgress />
      <FloatingElements />
      <Navigation />
      <main className="relative z-0">
        <Hero />
        <Features />
        <SimpleContent />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}