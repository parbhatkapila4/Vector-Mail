"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Brain,
  Zap,
  Search,
  Mail,
  Sparkles,
  Bot,
  Shield,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

const coreFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Email Analysis",
    description:
      "Advanced AI analyzes your emails to understand context, sentiment, and priority levels automatically.",
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Automatic sentiment detection",
      "Smart priority ranking",
      "Context-aware categorization",
      "Real-time email scoring",
    ],
  },
  {
    icon: Zap,
    title: "Smart Auto-Responses",
    description:
      "Generate intelligent, context-aware email responses in seconds with our AI writing assistant.",
    color: "from-yellow-500 to-orange-500",
    benefits: [
      "Matches your writing style",
      "Context-aware suggestions",
      "Multi-language support",
      "Instant draft generation",
    ],
  },
  {
    icon: Search,
    title: "Semantic Email Search",
    description:
      "Find emails by meaning, not just keywords. Search for concepts and ideas across your entire inbox.",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Natural language queries",
      "Concept-based matching",
      "Cross-language search",
      "Instant results",
    ],
  },
  {
    icon: Mail,
    title: "Smart Categorization",
    description:
      "Automatically organize emails into categories like work, personal, newsletters, and more.",
    color: "from-green-500 to-emerald-500",
    benefits: [
      "Automatic sorting",
      "Custom categories",
      "Newsletter detection",
      "VIP sender recognition",
    ],
  },
  {
    icon: Sparkles,
    title: "Priority Detection",
    description:
      "AI identifies urgent emails and highlights them so you never miss important messages.",
    color: "from-red-500 to-pink-500",
    benefits: [
      "Intelligent urgency scoring",
      "VIP sender detection",
      "Deadline awareness",
      "Smart notifications",
    ],
  },
  {
    icon: Bot,
    title: "Email Summarization",
    description:
      "Get concise summaries of long email threads to quickly understand the key points.",
    color: "from-indigo-500 to-purple-500",
    benefits: [
      "Instant thread summaries",
      "Action item extraction",
      "Decision tracking",
      "Timeline visualization",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level encryption, SOC 2 compliance, and zero-knowledge architecture to keep your data safe.",
    color: "text-blue-600",
  },
  {
    icon: Clock,
    title: "Time Tracking & Analytics",
    description:
      "Detailed insights into your email patterns and productivity metrics to optimize your workflow.",
    color: "text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    description:
      "Track response times, email volume, and engagement metrics with visual dashboards.",
    color: "text-green-600",
  },
  {
    icon: Users,
    title: "Multi-Account Support",
    description:
      "Connect and manage multiple email accounts from one unified, intelligent interface.",
    color: "text-orange-600",
  },
];

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  const [selectedFeature, setSelectedFeature] = useState<
    (typeof coreFeatures)[0] | null
  >(null);

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
            className="fixed inset-x-4 inset-y-4 z-[95] overflow-hidden sm:inset-x-8 sm:inset-y-8 md:inset-x-12 md:inset-y-12 lg:inset-x-20 lg:inset-y-16 xl:inset-x-32 xl:inset-y-20"
          >
            <div className="h-full w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="pr-16 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 backdrop-blur-sm"
                  >
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      AI-Powered Features
                    </span>
                  </motion.div>
                  <h2 className="mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                    VectorMail AI Features
                  </h2>
                  <p className="text-gray-600">
                    Discover the power of AI-driven email management
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
                    <div className="mb-10 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        Core AI Features
                      </h3>
                      <p className="text-gray-600">
                        Click on any feature to see more details
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {coreFeatures.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          onClick={() => setSelectedFeature(feature)}
                          className="group relative cursor-pointer rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-xl"
                        >
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-5 ${feature.color}`}
                          ></div>

                          <div className="relative">
                            <div
                              className={`h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} mb-4 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                            >
                              <feature.icon className="h-7 w-7 text-white" />
                            </div>
                            <h4 className="mb-2 text-lg font-bold text-gray-900">
                              {feature.title}
                            </h4>
                            <p className="mb-4 text-sm leading-relaxed text-gray-600">
                              {feature.description}
                            </p>

                            <div className="space-y-2">
                              {feature.benefits
                                .slice(0, 2)
                                .map((benefit, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-xs text-gray-500"
                                  >
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 transition-all group-hover:gap-2">
                              <span>Learn more</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="mb-10 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        Additional Capabilities
                      </h3>
                      <p className="text-gray-600">
                        More features to enhance your email experience
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {additionalFeatures.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.6 + index * 0.1,
                          }}
                          className="flex items-start gap-4 rounded-xl bg-gray-50 p-6 transition-colors hover:bg-gray-100"
                        >
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm`}
                          >
                            <feature.icon
                              className={`h-6 w-6 ${feature.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-1 text-base font-bold text-gray-900">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-8 text-center text-white"
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative">
                      <h3 className="mb-3 text-2xl font-bold">
                        Ready to Transform Your Inbox?
                      </h3>
                      <p className="mx-auto mb-6 max-w-2xl text-white/90">
                        Join thousands of professionals who are already using
                        VectorMail AI to save time and stay organized
                      </p>
                      <button
                        onClick={onClose}
                        className="rounded-xl bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition-colors hover:bg-gray-100"
                      >
                        Get Started Free
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedFeature && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[97] bg-black/80 backdrop-blur-sm"
                  onClick={() => setSelectedFeature(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed left-1/2 top-1/2 z-[99] w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl"
                >
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${selectedFeature.color} mb-6 flex items-center justify-center shadow-lg`}
                  >
                    <selectedFeature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="mb-3 text-2xl font-bold text-gray-900">
                    {selectedFeature.title}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {selectedFeature.description}
                  </p>

                  <h4 className="mb-3 font-semibold text-gray-900">
                    Key Benefits:
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedFeature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
