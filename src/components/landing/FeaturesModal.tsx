"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Zap, Shield, Search, Bot, BarChart3, Mail, Sparkles, MessageSquare, FileText, Clock, Users } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Email Analysis",
    description: "Advanced AI analyzes your emails to understand context, sentiment, and priority levels automatically.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Smart Auto-Responses",
    description: "Generate intelligent, context-aware email responses in seconds with our AI writing assistant.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find any email instantly using natural language queries. Search by meaning, not just keywords.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Bot,
    title: "Email Threading",
    description: "Automatically organize related emails into conversation threads for better email management.",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: BarChart3,
    title: "Email Analytics",
    description: "Get insights into your email patterns, response times, and communication effectiveness.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Shield,
    title: "Smart Security",
    description: "AI-powered spam detection and security analysis to keep your inbox safe and clean.",
    color: "from-red-500 to-pink-500"
  }
];

const keyFeatures = [
  {
    icon: Mail,
    title: "Multi-Account Support",
    description: "Connect multiple email accounts and manage them all from one unified interface."
  },
  {
    icon: Sparkles,
    title: "AI Compose Assistant",
    description: "Get AI-powered suggestions for email composition, tone, and content optimization."
  },
  {
    icon: MessageSquare,
    title: "Smart Categorization",
    description: "Automatically categorize emails by type, importance, and action required."
  },
  {
    icon: FileText,
    title: "Email Summarization",
    description: "Get concise summaries of long email threads and important conversations."
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "AI suggests optimal times to send emails based on recipient patterns and time zones."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share email insights and collaborate with team members on important communications."
  }
];

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  // Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Disable scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Re-enable scroll and restore position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 z-50 overflow-hidden"
          >
            <div className="w-full h-full bg-white rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-black">VectorMail AI Features</h2>
                  <p className="text-gray-600 mt-1">Discover the power of AI-driven email management</p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div 
                className="overflow-y-auto h-full"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
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
                <div className="p-8 pb-16">
                  {/* Main Features */}
                  <div className="mb-16">
                    <h3 className="text-xl font-bold text-black mb-8">Core AI Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-black mb-2">{feature.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div className="mb-12">
                    <h3 className="text-xl font-bold text-black mb-8">Additional Capabilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keyFeatures.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: (index + 6) * 0.1 }}
                          className="flex items-start gap-3 p-6 rounded-xl hover:bg-gray-50 transition-colors mb-6"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black mb-1">{feature.title}</h4>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
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
