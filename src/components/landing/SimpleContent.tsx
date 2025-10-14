"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const benefits = [
  "Save 2-3 hours daily on email management",
  "Never miss important messages again",
  "Respond faster with AI-generated drafts",
  "Find any email instantly with semantic search"
];

export function SimpleContent() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/mail");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <section className="relative py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-4">
            Why choose VectorMail?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their email workflow
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#875276' }}>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#875276' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 text-center">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-sm mx-auto">
                Join our beta program and experience the future of email management
              </p>
              <div className="w-full max-w-xs mx-auto">
                <Link href={isSignedIn ? "/mail" : "/sign-up"}>
                  <Button
                    size="lg"
                    className="w-full text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#875276' }}
                    onClick={handleClick}
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                No credit card required • Free during beta
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}