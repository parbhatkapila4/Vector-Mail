"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageSquare, Phone, Send, Heart } from "lucide-react";
import { useEffect } from "react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get in touch with our support team",
    contact: "help@vectormail.ai",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    icon: Mail,
    title: "General Inquiries",
    description: "For business partnerships and general questions",
    contact: "hello@vectormail.ai",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Phone,
    title: "Sales & Enterprise",
    description: "For enterprise solutions and custom implementations",
    contact: "sales@vectormail.ai",
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  }
];


interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
            <div className="w-full h-full bg-white rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 border-b border-gray-200">
                <div className="text-center pr-12 sm:pr-16">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/50 mb-2"
                  >
                    <Send className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Get in Touch</span>
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Contact Us
                  </h2>
                  <p className="text-gray-600 mt-1 text-xs sm:text-sm">Feel free to reach out to us anytime</p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
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
                  {/* Contact Methods */}
                  <div className="mb-12 sm:mb-16">
                    <div className="text-center mb-8 sm:mb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4"
                      >
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-blue-800 font-semibold text-sm sm:text-base">Get in Touch</span>
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Choose Your Preferred Contact Method</h3>
                      <p className="text-gray-600 text-sm sm:text-base">We&apos;re here to help you with any questions or concerns</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                      {contactInfo.map((contact, index) => (
                        <motion.div
                          key={contact.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`${contact.bgColor} ${contact.borderColor} border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                        >
                          {/* Background decoration */}
                          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8"></div>
                          
                          <div className="relative z-10">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${contact.color} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0`}>
                              <contact.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center sm:text-left">{contact.title}</h4>
                            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed text-center sm:text-left">{contact.description}</p>
                            <a 
                              href={`mailto:${contact.contact}`}
                              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/50 text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm transition-all duration-200 hover:bg-white hover:shadow-md group-hover:scale-105 break-all sm:break-normal"
                            >
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{contact.contact}</span>
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>


                  {/* Beautiful Contact Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center overflow-hidden"
                  >
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-x-10 sm:-translate-x-16 -translate-y-10 sm:-translate-y-16"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-tl from-pink-200/30 to-purple-200/30 rounded-full translate-x-12 sm:translate-x-20 translate-y-12 sm:translate-y-20"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full -translate-x-8 sm:-translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
                    
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="inline-flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/50 mb-4 sm:mb-6"
                      >
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                        <span className="text-gray-700 font-semibold text-sm sm:text-base">We&apos;d love to hear from you</span>
                      </motion.div>
                      
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                        Feel free to mail us at
                      </h3>
                      
                      <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                        Whether you have questions, need support, or want to explore our enterprise solutions, 
                        we&apos;re here to help you transform your email experience.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">General</h4>
                          <a 
                            href="mailto:hello@vectormail.ai" 
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm break-all"
                          >
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            hello@vectormail.ai
                          </a>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Support</h4>
                          <a 
                            href="mailto:help@vectormail.ai" 
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm break-all"
                          >
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            help@vectormail.ai
                          </a>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 hover:bg-white/80 transition-all duration-300 sm:col-span-2 lg:col-span-1"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Sales</h4>
                          <a 
                            href="mailto:sales@vectormail.ai" 
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm break-all"
                          >
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            sales@vectormail.ai
                          </a>
                        </motion.div>
                      </div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="mt-8 text-sm text-gray-500"
                      >
                        <p>✨ We typically respond within 24 hours</p>
                      </motion.div>
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
