"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Zap, Search, Mail, Sparkles, Bot } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Email Analysis",
    description:
      "Advanced AI analyzes your emails to understand context, sentiment, and priority levels automatically.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Smart Auto-Responses",
    description:
      "Generate intelligent, context-aware email responses in seconds with our AI writing assistant.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find any email instantly using natural language queries. Search by meaning, not just keywords.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "Email Threading",
    description:
      "Automatically organize related emails into conversation threads for better email management.",
    color: "from-green-500 to-teal-500",
  },
];

const keyFeatures = [
  {
    icon: Mail,
    title: "Multi-Account Support",
    description:
      "Connect multiple email accounts and manage them all from one unified interface.",
  },
  {
    icon: Sparkles,
    title: "AI Compose Assistant",
    description:
      "Get AI-powered suggestions for email composition, tone, and content optimization.",
  },
];

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-8 inset-y-4 z-50 overflow-hidden md:inset-x-12 md:inset-y-8 lg:inset-x-20 lg:inset-y-16 xl:inset-x-32 xl:inset-y-24"
          >
            <div className="h-full w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              <div className="relative border-b border-gray-200 p-4 sm:p-6">
                <div className="pr-12 text-center sm:pr-16">
                  <h2 className="text-xl font-bold text-black sm:text-2xl md:text-3xl">
                    VectorMail AI Features
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 sm:text-base">
                    Discover the power of AI-driven email management
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 sm:right-6 sm:top-6 sm:h-10 sm:w-10"
                >
                  <X className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
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
                    width: 6px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                  }
                `}</style>
                <div className="p-4 pb-16 sm:p-6 sm:pb-20 md:p-8 md:pb-24">
                  <div className="mb-12 sm:mb-16">
                    <h3 className="mb-6 text-lg font-bold text-black sm:mb-8 sm:text-xl">
                      Core AI Features
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="rounded-xl bg-gray-50 p-4 transition-all duration-300 hover:shadow-lg sm:rounded-2xl sm:p-6"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg bg-gradient-to-r sm:h-12 sm:w-12 sm:rounded-xl ${feature.color} mb-3 flex items-center justify-center sm:mb-4`}
                          >
                            <feature.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                          </div>
                          <h4 className="mb-2 text-base font-semibold text-black sm:text-lg">
                            {feature.title}
                          </h4>
                          <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                            {feature.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-12 sm:mb-16 md:mb-20">
                    <h3 className="mb-6 text-lg font-bold text-black sm:mb-8 sm:text-xl">
                      Additional Capabilities
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      {keyFeatures.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: (index + 6) * 0.1,
                          }}
                          className="mb-1 flex items-start gap-3 rounded-lg p-3 pb-4 transition-colors hover:bg-gray-50 sm:mb-2 sm:rounded-xl sm:p-4 sm:pb-5"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-10 sm:w-10">
                            <feature.icon className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                          </div>
                          <div>
                            <h4 className="mb-1 text-sm font-semibold text-black sm:text-base">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-gray-600 sm:text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
