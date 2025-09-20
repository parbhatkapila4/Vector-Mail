"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Zap, Crown } from "lucide-react";
import { useEffect, useState } from "react";

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for individuals getting started with AI email management",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Up to 3 email accounts",
      "Basic AI email analysis",
      "Smart categorization",
      "Email search & filtering",
      "Mobile app access",
      "Basic support"
    ],
    limitations: [
      "Limited to 100 AI responses per month",
      "Basic email templates only"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "$19",
    period: "per month",
    description: "Ideal for professionals and small teams who need advanced AI features",
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
      "Priority support",
      "API access"
    ],
    limitations: [],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    description: "For large teams and organizations requiring enterprise-grade features",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    features: [
      "Everything in Professional",
      "Team collaboration tools",
      "Advanced security features",
      "Custom AI model training",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics & reporting",
      "SLA guarantee",
      "24/7 phone support"
    ],
    limitations: [],
    popular: false
  }
];


interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastDescription, setToastDescription] = useState("");
  const [toastType, setToastType] = useState<"success" | "info">("info");

  const handlePlanClick = (planName: string) => {
    if (planName === 'Starter') {
      setToastMessage("Welcome to VectorMail AI!");
      setToastDescription("You can start using our free features right away!");
      setToastType("success");
    } else {
      setToastMessage("Premium Features Coming Soon!");
      setToastDescription("We're working hard to bring you these amazing premium features. Stay tuned for updates!");
      setToastType("info");
    }
    setShowToast(true);
    
    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

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
            className="fixed inset-y-4 md:inset-y-8 lg:inset-y-16 xl:inset-y-24 inset-x-8 md:inset-x-12 lg:inset-x-20 xl:inset-x-32 z-50 overflow-hidden"
          >
            <div className="w-full h-full bg-white rounded-t-3xl shadow-2xl overflow-hidden relative">
              {/* Custom Toast */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 max-w-xs sm:max-w-sm"
                  >
                    <div className={`rounded-lg sm:rounded-xl shadow-lg border p-3 sm:p-4 ${
                      toastType === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          toastType === 'success' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}>
                          {toastType === 'success' ? (
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">i</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-xs sm:text-sm ${
                            toastType === 'success' ? 'text-green-800' : 'text-blue-800'
                          }`}>
                            {toastMessage}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            toastType === 'success' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {toastDescription}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowToast(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="relative p-4 sm:p-6 border-b border-gray-200">
                <div className="text-center pr-12 sm:pr-16">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">VectorMail AI Pricing</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Choose the perfect plan for your email management needs</p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
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
                <div className="p-4 sm:p-6 md:p-8 pb-20">
                  {/* Pricing Cards */}
                  <div className="mb-12 sm:mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                      {pricingPlans.map((plan, index) => (
                        <motion.div
                          key={plan.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 transition-all duration-300 hover:shadow-xl flex flex-col ${
                            plan.popular 
                              ? 'border-purple-500 shadow-lg sm:scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                                Most Popular
                              </div>
                            </div>
                          )}
                          
                          <div className="text-center mb-6 sm:mb-8">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                              <plan.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">{plan.name}</h3>
                            <div className="mb-3 sm:mb-4">
                              <span className="text-3xl sm:text-4xl font-bold text-black">{plan.price}</span>
                              <span className="text-gray-600 ml-2 text-sm sm:text-base">{plan.period}</span>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm">{plan.description}</p>
                          </div>

                          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                              </div>
                            ))}
                            {plan.limitations.map((limitation, limitIndex) => (
                              <div key={limitIndex} className="flex items-start gap-2 sm:gap-3">
                                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 text-xs sm:text-sm">{limitation}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto pt-2 pb-4">
                            <button 
                              onClick={() => handlePlanClick(plan.name)}
                              className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                                plan.popular
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                  : plan.name === 'Starter'
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                  : 'bg-black text-white hover:bg-gray-800'
                              }`}
                            >
                              {plan.name === 'Starter' ? 'Get Started Free' : `Choose ${plan.name}`}
                            </button>
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
