"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Users, Grid, Boxes } from "lucide-react";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProCheckout = () => {
    const proUrl = "https://checkout.dodopayments.com/buy/pdt_0NWp3mqNs4HTgUfiuQiG5?quantity=1&redirect_url=https://vectormail.space";
    window.location.href = proUrl;
  };

  const handleEnterpriseCheckout = () => {
    const enterpriseUrl = "https://checkout.dodopayments.com/buy/pdt_0NWp3NKQbiB3QzIER1ESN?quantity=1&redirect_url=https://vectormail.space%2F";
    window.location.href = enterpriseUrl;
  };

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
      price: "$12.34",
      originalPrice: "$12.99",
      discount: "5%",
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
      price: "$54",
      originalPrice: "$60",
      discount: "10%",
      period: "/month",
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
      cta: "Get Started",
      ctaLink: "/sign-up",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <div
        className={`fixed left-4 top-4 z-40 transition-opacity duration-300 sm:left-8 sm:top-6 sm:opacity-100 ${isScrolled ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
      >
        <Link href="/">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-white transition-all hover:scale-105 hover:border-slate-700 hover:bg-slate-800/50 sm:px-4">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Back</span>
          </button>
        </Link>
      </div>

      <section className="relative overflow-hidden bg-[#0a0a0a] pb-32 pt-16 sm:pt-20 lg:pt-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="mb-6 text-5xl font-black text-white sm:text-6xl md:text-7xl">
              Flexible Pricing Plans for Every Need
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-center text-lg font-semibold text-white sm:text-left sm:text-xl">
              Choose the plan that best fits your requirements and start
              optimizing your time today!
            </p>
          </motion.div>

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
                <div
                  className={`absolute -inset-1 rounded-2xl transition-opacity duration-300 ${plan.isPopular
                      ? "bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-500/20 opacity-60 blur-xl group-hover:opacity-80"
                      : "opacity-0"
                    }`}
                  style={{ willChange: "opacity" }}
                />

                <div
                  className={`relative flex h-full flex-col rounded-2xl border bg-[#0a0a0a] p-8 transition-all duration-300 ${plan.isPopular
                      ? "border-orange-500/50 shadow-2xl shadow-orange-500/20"
                      : "border-slate-800 hover:border-slate-700"
                    } group-hover:-translate-y-2`}
                  style={{ willChange: "transform, border-color" }}
                >
                  {plan.isPopular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      <div className="rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/50">
                        MOST POPULAR
                      </div>
                    </motion.div>
                  )}

                  <div
                    className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 sm:mx-0 ${plan.isPopular
                        ? "bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500"
                        : "bg-slate-900/50"
                      }`}
                  >
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="mb-3 text-center text-2xl font-bold text-white sm:text-left">
                    {plan.name}
                  </h3>

                  <p className="mb-6 text-center text-sm font-medium leading-relaxed text-white sm:text-left">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    {plan.discount && (
                      <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                          {plan.discount} OFF
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-1 sm:justify-start">
                      {plan.originalPrice && (
                        <span className="text-xl font-medium text-slate-500 line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-5xl font-black text-white">
                        {plan.price}
                      </span>
                      <span className="text-lg font-medium text-white">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-8 flex-grow space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="mx-auto flex max-w-fit items-start gap-3 sm:mx-0 sm:max-w-none"
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${plan.isPopular
                              ? "border border-orange-500/50 bg-gradient-to-br from-orange-500/30 to-amber-500/30"
                              : "bg-slate-800"
                            }`}
                        >
                          <CheckCircle
                            className={`h-3 w-3 ${plan.isPopular ? "text-orange-400" : "text-white"}`}
                          />
                        </div>
                        <span className="text-center text-sm font-medium text-white sm:text-left">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.name === "Basic" ? (
                    <Link href={plan.ctaLink}>
                      <button
                        className={`active:scale-98 w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 ${plan.isPopular
                            ? "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/50"
                            : "border border-slate-800 bg-slate-900/50 text-white hover:border-slate-700 hover:bg-slate-800/50"
                          }`}
                        style={{ willChange: "transform" }}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  ) : plan.name === "Pro" ? (
                    <button
                      onClick={handleProCheckout}
                      className={`active:scale-98 w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 ${plan.isPopular
                          ? "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/50"
                          : "border border-slate-800 bg-slate-900/50 text-white hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      style={{ willChange: "transform" }}
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <button
                      onClick={handleEnterpriseCheckout}
                      className={`active:scale-98 w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 ${plan.isPopular
                          ? "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/50"
                          : "border border-slate-800 bg-slate-900/50 text-white hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      style={{ willChange: "transform" }}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

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
                  <div className="absolute -inset-1 rounded-xl opacity-0" />
                  <div className="relative rounded-xl border border-slate-800 bg-[#0a0a0a] p-6 transition-all hover:border-slate-700">
                    <h3 className="mb-2 text-center text-lg font-bold text-white sm:text-left">
                      {faq.q}
                    </h3>
                    <p className="text-center text-sm font-medium leading-relaxed text-white sm:text-left">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-32 text-center"
          >
            <h2 className="mb-4 text-4xl font-black">
              <span className="text-white">Still have questions? </span>
              <span className="text-white">We're here to help</span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl font-semibold text-white">
              Our team is ready to answer any questions about plans, features,
              or custom requirements.
            </p>
            <Link href="mailto:parbhat@parbhat.dev">
              <button className="rounded-xl border border-slate-800 bg-slate-900/50 px-10 py-4 text-lg font-semibold text-white transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-lg">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
