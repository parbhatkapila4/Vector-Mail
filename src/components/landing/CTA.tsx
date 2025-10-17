"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function CTA() {
  const { isSignedIn } = useUser();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Ready to take control of your inbox?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of professionals who've transformed their email workflow.
          </p>
          
          <div className="pt-4">
            <Link href={isSignedIn ? "/mail" : "/sign-up"}>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium">
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required · 2-minute setup · Free forever
          </p>
        </motion.div>
      </div>
    </section>
  );
}
