"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-6">
            Ready to transform your email?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the beta program today and experience the future of intelligent email management
          </p>
          
          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <Button
              size="lg"
              className="text-white px-10 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: '#875276' }}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free during beta • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}