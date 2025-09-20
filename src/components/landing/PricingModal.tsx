"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Zap, Crown, Users, Mail, Brain, Shield, Clock } from "lucide-react";
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

const additionalFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced machine learning algorithms that understand your email patterns and preferences"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC 2 compliance, and advanced threat detection"
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "AI suggests optimal send times based on recipient behavior and time zones"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share insights, assign tasks, and collaborate on important email communications"
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
            className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 z-50 overflow-hidden"
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
                    className="absolute top-4 right-4 z-50 max-w-sm"
                  >
                    <div className={`rounded-xl shadow-lg border p-4 ${
                      toastType === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          toastType === 'success' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}>
                          {toastType === 'success' ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">i</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
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
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="relative p-6 border-b border-gray-200">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-black">VectorMail AI Pricing</h2>
                  <p className="text-gray-600 mt-1">Choose the perfect plan for your email management needs</p>
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
                <div className="p-8 pb-20">
                  {/* Pricing Cards */}
                  <div className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {pricingPlans.map((plan, index) => (
                        <motion.div
                          key={plan.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl flex flex-col ${
                            plan.popular 
                              ? 'border-purple-500 shadow-lg scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                Most Popular
                              </div>
                            </div>
                          )}
                          
                          <div className="text-center mb-8">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                              <plan.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                            <div className="mb-4">
                              <span className="text-4xl font-bold text-black">{plan.price}</span>
                              <span className="text-gray-600 ml-2">{plan.period}</span>
                            </div>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>

                          <div className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </div>
                            ))}
                            {plan.limitations.map((limitation, limitIndex) => (
                              <div key={limitIndex} className="flex items-start gap-3">
                                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 text-sm">{limitation}</span>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => handlePlanClick(plan.name)}
                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                              plan.popular
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                : plan.name === 'Starter'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                            {plan.name === 'Starter' ? 'Get Started Free' : `Choose ${plan.name}`}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div className="mb-12">
                    <h3 className="text-xl font-bold text-black mb-8 text-center">Why Choose VectorMail AI?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {additionalFeatures.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                          className="flex items-start gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black mb-2">{feature.title}</h4>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-black mb-6 text-center">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-black mb-2">Can I change plans anytime?</h4>
                        <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">Is there a free trial?</h4>
                        <p className="text-gray-600 text-sm">Our Starter plan is completely free forever. Professional and Enterprise plans come with a 14-day free trial.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">What payment methods do you accept?</h4>
                        <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">Do you offer custom enterprise solutions?</h4>
                        <p className="text-gray-600 text-sm">Yes, we provide custom solutions for large organizations including dedicated infrastructure, custom AI training, and white-label options. Contact our sales team for a personalized quote.</p>
                      </div>
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
