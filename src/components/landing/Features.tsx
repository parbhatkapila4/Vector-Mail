"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";



const companies = [
  { name: "Slack", logo: "slack" },
  { name: "Strapi", logo: "strapi" },
  { name: "Mapbox", logo: "mapbox" },
  { name: "Stencil", logo: "stencil" },
  { name: "Spotify", logo: "spotify" },
  { name: "WooCommerce", logo: "woocommerce" }
];

export function Features() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push('/mail');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-8">
            Trusted by 800,000+ highly productive companies
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex items-center gap-12 md:gap-16 opacity-60"
              animate={{ x: [0, -100 * companies.length] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...companies, ...companies].map((company, index) => (
                <motion.div
                  key={`${company.name}-${index}`}
                  className="text-gray-400 font-medium text-lg hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                  {company.name}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Image src="/img.png" alt="Features" width={500} height={500} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-black font-medium text-sm uppercase tracking-wider mb-4"
                >
                  How It Works
                </motion.p>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-black mb-6"
                >
                  Connect with AI chatbot
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  viewport={{ once: true }}
                  className="text-gray-600 text-lg leading-relaxed mb-8"
                >
                  Identify the platform or interface through which you can access the chatbot. This could be a website, a messaging app, or a dedicated application.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="group cursor-pointer relative inline-block" onClick={handleClick}>
                  {/* Floating cards effect */}
                  <motion.div
                    className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                    animate={{ 
                      rotate: [0, 1, -1, 0],
                      scale: [1, 1.02, 0.98, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main interactive element */}
                  <motion.div
                    className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 rounded-2xl border border-gray-800 group-hover:border-gray-600 transition-all duration-300"
                    whileHover={{ 
                      scale: 1.02,
                      rotateY: 2
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Glowing particles */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <motion.div
                        className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0
                        }}
                      />
                      <motion.div
                        className="absolute top-6 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-80"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      />
                      <motion.div
                        className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-70"
                        animate={{
                          y: [0, -6, 0],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 1
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Bot className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <p className="text-white font-semibold text-lg">Start Chatting</p>
                          <p className="text-gray-400 text-sm">Experience AI like never before</p>
                        </div>
                      </div>
                      
                      <motion.div
                        className="text-gray-400 group-hover:text-white transition-colors"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight className="w-6 h-6" />
                      </motion.div>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
