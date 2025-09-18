
import React from 'react'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

function page() {
  return (
    <div className="bg-white text-black">
      <Navigation />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}

export default page