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
  { name: "WooCommerce", logo: "woocommerce" },
];

export function Features() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/mail");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <p className="mb-8 text-sm uppercase tracking-wider text-gray-500">
            Trusted by 800,000+ highly productive companies
          </p>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex items-center gap-12 opacity-60 md:gap-16"
              animate={{ x: [0, -100 * companies.length] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...companies, ...companies].map((company, index) => (
                <motion.div
                  key={`${company.name}-${index}`}
                  className="whitespace-nowrap text-lg font-medium text-gray-400 transition-opacity hover:opacity-100"
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
          className="mt-32 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg md:p-12"
        >
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
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
                  className="mb-4 text-sm font-medium uppercase tracking-wider text-black"
                >
                  How It Works
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="mb-6 text-4xl font-bold text-black md:text-5xl"
                >
                  Connect with AI chatbot
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  viewport={{ once: true }}
                  className="mb-8 text-lg leading-relaxed text-gray-600"
                >
                  Identify the platform or interface through which you can
                  access the chatbot. This could be a website, a messaging app,
                  or a dedicated application.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div
                  className="group relative inline-block cursor-pointer"
                  onClick={handleClick}
                >
                  {/* Floating cards effect */}
                  <motion.div
                    className="absolute -left-2 -top-2 h-full w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-sm transition-opacity duration-300 group-hover:opacity-50"
                    animate={{
                      rotate: [0, 1, -1, 0],
                      scale: [1, 1.02, 0.98, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="relative rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 transition-all duration-300 group-hover:border-gray-600"
                    whileHover={{
                      scale: 1.02,
                      rotateY: 2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <motion.div
                        className="absolute left-4 top-4 h-2 w-2 rounded-full bg-blue-400 opacity-60"
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className="absolute right-8 top-6 h-1 w-1 rounded-full bg-purple-400 opacity-80"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      />
                      <motion.div
                        className="absolute bottom-6 left-8 h-1.5 w-1.5 rounded-full bg-pink-400 opacity-70"
                        animate={{
                          y: [0, -6, 0],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-3"
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Bot className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <p className="text-lg font-semibold text-white">
                            Start Chatting
                          </p>
                          <p className="text-sm text-gray-400">
                            Experience AI like never before
                          </p>
                        </div>
                      </div>

                      <motion.div
                        className="text-gray-400 transition-colors group-hover:text-white"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight className="h-6 w-6" />
                      </motion.div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
