"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Users, Grid, Boxes, Mail } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans = [
    {
      name: "Basic",
      icon: Users,
      description:
        "Perfect for individuals looking to streamline their email with essential AI features.",
      price: "Free",
      period: "forever",
      isPopular: false,
      features: [
        "AI Email Summaries (5/day)",
        "Basic Semantic Search",
        "Keyboard Shortcuts",
        "Email Templates",
        "Single Account Support",
        "Community Support",
      ],
      cta: "Get Started",
      ctaLink: "/sign-up",
    },
    {
      name: "Pro",
      icon: Grid,
      description:
        "Ideal for professionals needing advanced AI capabilities and unlimited features.",
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
        "Custom Email Categories",
      ],
      cta: "Get Started",
      ctaLink: "/sign-up",
    },
    {
      name: "Enterprise",
      icon: Boxes,
      description:
        "Tailored for teams requiring enterprise-grade features, security, and dedicated support.",
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
        "Custom SLA & Uptime Guarantee",
      ],
      cta: "Contact Sales",
      ctaLink: "mailto:help@productionsolution.net",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black">
      <Navigation />

      {/* Back Button */}
      <div
        className={`fixed left-4 top-28 z-40 transition-opacity duration-300 sm:left-8 sm:top-32 sm:opacity-100 ${
          isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-white/5 px-3 py-2 text-white transition-all hover:scale-105 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      {/* Pricing Section */}
      <section className="relative overflow-hidden pb-32 pt-48">
        {/* Background effects */}
        <div className="absolute inset-0 bg-black">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Diagonal gradient streak */}
          <div
            className="absolute right-0 top-0 h-[800px] w-[800px] opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(59, 130, 246, 0.2) 100%)",
              transform: "rotate(-15deg) translateX(200px) translateY(-200px)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            {/* Pricing Badge */}
            <motion.div
              className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2"
              animate={{
                borderColor: [
                  "rgba(168, 85, 247, 0.3)",
                  "rgba(251, 191, 36, 0.3)",
                  "rgba(168, 85, 247, 0.3)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-sm font-semibold text-purple-300">
                Pricing Coming Soon
              </span>
            </motion.div>

            <h1 className="mb-6 text-5xl font-black text-white sm:text-6xl md:text-7xl">
              Flexible Pricing Plans for Every Need
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-lg text-gray-400 text-center sm:text-left sm:text-xl">
              Choose the plan that best fits your requirements and start
              optimizing your time today!
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 rounded-full border border-purple-500/30 bg-white/5 p-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annually")}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  billingCycle === "annually"
                    ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annually
                {billingCycle === "annually" && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    20% Off
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className={`group relative ${plan.isPopular ? "md:scale-105" : ""}`}
                style={{ willChange: "transform" }}
              >
                {/* Static glow effect - hover activated */}
                <div
                  className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 blur-xl transition-opacity duration-300 ${
                    plan.isPopular ? "opacity-60" : "opacity-40"
                  } group-hover:opacity-80`}
                  style={{ willChange: "opacity" }}
                />

                {/* Card */}
                <div
                  className={`relative flex h-full flex-col rounded-2xl border bg-gradient-to-br from-zinc-900 to-black p-8 transition-all duration-300 ${
                    plan.isPopular
                      ? "border-purple-500/50 shadow-2xl shadow-purple-500/20"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } group-hover:-translate-y-2`}
                  style={{ willChange: "transform, border-color" }}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      <div className="rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-1 text-xs font-bold text-white shadow-lg">
                        MOST POPULAR
                      </div>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 mx-auto sm:mx-0 ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400"
                        : "bg-white/10"
                    }`}
                  >
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="mb-3 text-2xl font-bold text-white text-center sm:text-left">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-sm leading-relaxed text-gray-400 text-center sm:text-left">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-5xl font-black text-white">
                        {plan.price}
                      </span>
                      <span className="text-lg text-gray-500">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mb-8 flex-grow space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 mx-auto sm:mx-0 max-w-fit sm:max-w-none">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400"
                              : "bg-purple-500/30"
                          }`}
                        >
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 text-center sm:text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={plan.ctaLink}>
                    <button
                      className={`active:scale-98 w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        plan.isPopular
                          ? "bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white hover:shadow-lg hover:shadow-purple-500/50"
                          : "border border-purple-500/30 bg-white/5 text-white hover:border-purple-500/50 hover:bg-white/10"
                      }`}
                      style={{ willChange: "transform" }}
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
            className="mx-auto mt-32 max-w-3xl"
          >
            <h2 className="mb-12 text-center text-4xl font-black text-white">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Can I switch plans anytime?",
                  a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
                },
                {
                  q: "Is there a free trial for Pro?",
                  a: "Yes! All Pro features are available free for 14 days. No credit card required.",
                },
                {
                  q: "What happens to my data if I cancel?",
                  a: "Your data remains accessible for 30 days. You can export everything before permanent deletion.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative rounded-xl border border-purple-500/20 bg-white/5 p-6 transition-all hover:border-purple-500/40">
                    <h3 className="mb-2 text-lg font-bold text-white text-center sm:text-left">
                      {faq.q}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400 text-center sm:text-left">
                      {faq.a}
                    </p>
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
            <h2 className="mb-4 text-4xl font-black">
              <span className="text-white">Still have questions? </span>
              <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                We're here to help
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-gray-400">
              Our team is ready to answer any questions about plans, features,
              or custom requirements.
            </p>
            <Link href="mailto:help@productionsolution.net">
              <button className="rounded-xl border border-purple-500/30 px-10 py-4 text-lg font-semibold text-white transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
