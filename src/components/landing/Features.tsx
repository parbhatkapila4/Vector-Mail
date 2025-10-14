"use client";

import { motion } from "framer-motion";
import { Brain, MessageSquare, Search, Shield } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Understand context, sentiment, and priority automatically"
  },
  {
    icon: MessageSquare,
    title: "Smart Responses",
    description: "Generate intelligent replies that match your style"
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find emails by meaning, not just keywords"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption with zero-knowledge architecture"
  }
];

export function Features() {
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
    <section className="relative py-24 bg-background">
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
            Everything you need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful AI features designed for modern professionals
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#875276' }}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href={isSignedIn ? "/mail" : "/sign-up"}>
            <Button
              size="lg"
              className="text-white px-8 py-3 text-lg font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#875276' }}
              onClick={handleClick}
            >
              Get Started Free
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}