"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Users, Grid, Boxes, Mail } from "lucide-react"
import { Navigation } from "@/components/landing/Navigation"
import { Footer } from "@/components/landing/Footer"
import { useState } from "react"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually")

  const plans = [
    {
      name: "Basic",
      icon: Users,
      description: "Perfect for individuals looking to streamline their email with essential AI features.",
      price: "Free",
      period: "forever",
      isPopular: false,
      features: [
        "AI Email Summaries (5/day)",
        "Basic Semantic Search",
        "Keyboard Shortcuts",
        "Email Templates",
        "Single Account Support",
        "Community Support"
      ],
      cta: "Get Started",
      ctaLink: "/sign-up"
    },
    {
      name: "Pro",
      icon: Grid,
      description: "Ideal for professionals needing advanced AI capabilities and unlimited features.",
      price: billingCycle === "monthly" ? "$12.99" : "$9.99",
      period: "/month",
      isPopular: true,
      features: [
        "All Basic Plan Features",
        "Unlimited AI Summaries",
        "Advanced Vector Search",
        "Custom Automation Rules",
        "Multi-Account Support (up to 5)",
        "Priority Email Support",
        "Advanced Analytics Dashboard",
        "Custom Email Categories"
      ],
      cta: "Get Started",
      ctaLink: "/sign-up"
    },
    {
      name: "Enterprise",
      icon: Boxes,
      description: "Tailored for teams requiring enterprise-grade features, security, and dedicated support.",
      price: "Custom",
      period: "pricing",
      isPopular: false,
      features: [
        "All Pro Plan Features",
        "Dedicated Account Manager",
        "Custom AI Model Training",
        "Advanced Security & Compliance",
        "Unlimited Accounts",
        "Team Collaboration Tools",
        "SSO & SAML Integration",
        "24/7 Premium Support",
        "Custom SLA & Uptime Guarantee"
      ],
      cta: "Contact Sales",
      ctaLink: "mailto:help@productionsolution.net"
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Back Button */}
      <div className="fixed top-32 left-8 z-40">
        <Link href="/">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white transition-all hover:scale-105">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </Link>
      </div>

      {/* Pricing Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-black">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
          
          {/* Diagonal gradient streak */}
          <div 
            className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(59, 130, 246, 0.2) 100%)",
              transform: "rotate(-15deg) translateX(200px) translateY(-200px)",
              filter: "blur(100px)"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Pricing Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6"
              animate={{
                borderColor: ["rgba(168, 85, 247, 0.3)", "rgba(251, 191, 36, 0.3)", "rgba(168, 85, 247, 0.3)"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-purple-300 text-sm font-semibold">Pricing Coming Soon</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 text-white">
              Flexible Pricing Plans for Every Need
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              Choose the plan that best fits your requirements and start optimizing your time today!
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/5 rounded-full p-2 border border-purple-500/30">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === "annually"
                    ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annually
                {billingCycle === "annually" && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">20% Off</span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.15,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                className={`relative group ${plan.isPopular ? 'md:scale-105' : ''}`}
                style={{ willChange: 'transform' }}
              >
                {/* Static glow effect - hover activated */}
                <div 
                  className={`absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-xl transition-opacity duration-300 ${
                    plan.isPopular ? 'opacity-60' : 'opacity-40'
                  } group-hover:opacity-80`}
                  style={{ willChange: 'opacity' }}
                />
                
                {/* Card */}
                <div 
                  className={`relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl border p-8 h-full flex flex-col transition-all duration-300 ${
                    plan.isPopular 
                      ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                      : 'border-purple-500/30 hover:border-purple-500/50'
                  } group-hover:-translate-y-2`}
                  style={{ willChange: 'transform, border-color' }}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      <div className="px-4 py-1 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 rounded-full text-white text-xs font-bold shadow-lg">
                        MOST POPULAR
                      </div>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110 ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400'
                      : 'bg-white/10'
                  }`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">{plan.price}</span>
                      <span className="text-gray-500 text-lg">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400'
                            : 'bg-purple-500/30'
                        }`}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={plan.ctaLink}>
                    <button 
                      className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-98 ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white hover:shadow-lg hover:shadow-purple-500/50'
                          : 'bg-white/5 border border-purple-500/30 text-white hover:bg-white/10 hover:border-purple-500/50'
                      }`}
                      style={{ willChange: 'transform' }}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-32 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-black text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "Can I switch plans anytime?",
                  a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
                },
                {
                  q: "Is there a free trial for Pro?",
                  a: "Yes! All Pro features are available free for 14 days. No credit card required."
                },
                {
                  q: "What happens to my data if I cancel?",
                  a: "Your data remains accessible for 30 days. You can export everything before permanent deletion."
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked."
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all">
                    <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-32 text-center"
          >
            <h2 className="text-4xl font-black mb-4">
              <span className="text-white">Still have questions? </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                We're here to help
              </span>
            </h2>
            <p className="text-gray-400 mb-8">
              Our team is ready to answer any questions about plans, features, or custom requirements.
            </p>
            <Link href="mailto:help@productionsolution.net">
              <button className="px-10 py-4 border border-purple-500/30 text-white rounded-xl font-semibold text-lg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

