"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Zap, Crown, Sparkles, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description:
      "Perfect for individuals getting started with AI email management",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Up to 3 email accounts",
      "Basic AI email analysis",
      "Smart categorization",
      "Email search & filtering",
      "Mobile app access",
      "5GB storage",
      "Basic support",
    ],
    limitations: [
      "Limited to 100 AI responses per month",
      "Basic email templates only",
      "Standard response time",
    ],
    popular: false,
    badge: null,
  },
  {
    name: "Professional",
    price: "$19",
    period: "per month",
    description:
      "Ideal for professionals and small teams who need advanced AI features",
    icon: Star,
    color: "from-purple-500 to-pink-500",
    features: [
      "Unlimited email accounts",
      "Advanced AI email analysis",
      "Smart auto-responses",
      "Email threading & organization",
      "Priority email detection",
      "Custom email templates",
      "Advanced search & filters",
      "Email analytics dashboard",
      "50GB storage",
      "Priority support (24-48hr)",
      "API access",
      "Chrome extension",
    ],
    limitations: [],
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    description:
      "For large teams and organizations requiring enterprise-grade features",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    features: [
      "Everything in Professional",
      "Unlimited storage",
      "Team collaboration tools",
      "Advanced security features",
      "Custom AI model training",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics & reporting",
      "SLA guarantee (99.9% uptime)",
      "24/7 phone support",
      "On-premise deployment option",
    ],
    limitations: [],
    popular: false,
    badge: "Enterprise",
  },
];

const faqItems = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your subscription at any time. No questions asked, no cancellation fees.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely! You can change your plan at any time. Changes take effect immediately.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! We use bank-level encryption and are SOC 2, GDPR, and HIPAA compliant.",
  },
];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [, setSelectedPlan] = useState<string | null>(null);
  const [showFAQ, setShowFAQ] = useState<number | null>(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 inset-y-4 z-[95] overflow-hidden sm:inset-x-8 md:inset-x-12 md:inset-y-8 lg:inset-x-20 lg:inset-y-16 xl:inset-x-32 xl:inset-y-20"
          >
            <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Header */}
              <div className="relative border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 p-6">
                <div className="pr-16 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 backdrop-blur-sm"
                  >
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Simple, Transparent Pricing
                    </span>
                  </motion.div>
                  <h2 className="mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                    Choose Your Plan
                  </h2>
                  <p className="text-gray-600">
                    Select the perfect plan for your email management needs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/80 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div
                className="h-full overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db #f3f4f6",
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                  }
                `}</style>
                <div className="p-8 pb-24">
                  
                  <div className="mb-16">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {pricingPlans.map((plan, index) => (
                        <motion.div
                          key={plan.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 transition-all duration-300 hover:shadow-2xl ${
                            plan.popular
                              ? "scale-105 border-purple-500 shadow-xl"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {plan.badge && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                              <div
                                className={`bg-gradient-to-r ${plan.color} rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg`}
                              >
                                {plan.badge}
                              </div>
                            </div>
                          )}

                          <div className="mb-8 text-center">
                            <div
                              className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${plan.color} mx-auto mb-4 flex items-center justify-center shadow-lg`}
                            >
                              <plan.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-black">
                              {plan.name}
                            </h3>
                            <div className="mb-4">
                              <span className="text-4xl font-bold text-black">
                                {plan.price}
                              </span>
                              <span className="ml-2 text-gray-600">
                                {plan.period}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {plan.description}
                            </p>
                          </div>

                          <div className="mb-8 flex-1 space-y-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                              What's Included
                            </div>
                            {plan.features.map((feature, featureIndex) => (
                              <div
                                key={featureIndex}
                                className="flex items-start gap-3"
                              >
                                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span className="text-sm text-gray-700">
                                  {feature}
                                </span>
                              </div>
                            ))}
                            {plan.limitations.length > 0 && (
                              <>
                                <div className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Limitations
                                </div>
                                {plan.limitations.map(
                                  (limitation, limitIndex) => (
                                    <div
                                      key={limitIndex}
                                      className="flex items-start gap-3"
                                    >
                                      <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                                      <span className="text-sm text-gray-500">
                                        {limitation}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </>
                            )}
                          </div>

                          <div className="mt-auto">
                            <Link href={isSignedIn ? "/mail" : "/sign-up"}>
                              <button
                                onClick={() => setSelectedPlan(plan.name)}
                                className={`w-full rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                                  plan.popular
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600"
                                    : plan.name === "Starter"
                                      ? "border-2 border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                      : "bg-black text-white hover:bg-gray-800"
                                }`}
                              >
                                {plan.name === "Starter"
                                  ? "Get Started Free"
                                  : `Choose ${plan.name}`}
                              </button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  
                  <div className="mb-16">
                    <div className="mb-10 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        Frequently Asked Questions
                      </h3>
                      <p className="text-gray-600">
                        Everything you need to know about our pricing
                      </p>
                    </div>
                    <div className="mx-auto max-w-3xl space-y-4">
                      {faqItems.map((faq, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="overflow-hidden rounded-xl border border-gray-200"
                        >
                          <button
                            onClick={() =>
                              setShowFAQ(showFAQ === index ? null : index)
                            }
                            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-5 w-5 flex-shrink-0 text-purple-600" />
                              <span className="font-semibold text-gray-900">
                                {faq.question}
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: showFAQ === index ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {showFAQ === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-5 pt-0 text-gray-600">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                  >
                    <div className="inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl bg-gray-50 p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>30-day money back</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Cancel anytime</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>No credit card required</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
