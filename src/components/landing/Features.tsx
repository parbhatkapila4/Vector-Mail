"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  Zap, 
  Search, 
  Shield, 
  Mail, 
  Clock,
  TrendingUp,
  CheckCircle2,
  Code,
  Sparkles,
  BarChart3
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { HoverEffect } from "../ui/card-hover-effect";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced ML analyzes context, sentiment, and priority.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process thousands of emails in seconds.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find emails using natural language queries.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2, GDPR, and HIPAA compliant.",
  },
  {
    icon: Mail,
    title: "Smart Responses",
    description: "AI responses that match your style.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Detailed analytics and insights.",
  },
];

    const bentoFeatures = [
      {
        title: "AI Email Assistant",
        description: "Your personal AI that learns and adapts to your email patterns",
        icon: Brain,
        gradient: "linear-gradient(135deg, #5A0B4D, #8B5A7A)",
        span: "md:col-span-2 md:row-span-2",
      },
      {
        title: "Real-time Analytics",
        description: "Track email performance and response times",
        icon: BarChart3,
        gradient: "linear-gradient(135deg, #8B5A7A, #7A3B6A)",
        span: "md:col-span-1",
      },
      {
        title: "Smart Automation",
        description: "Automate repetitive tasks effortlessly",
        icon: Zap,
        gradient: "linear-gradient(135deg, #7A3B6A, #5A0B4D)",
        span: "md:col-span-1",
      },
      {
        title: "API Integration",
        description: "Connect with your favorite tools",
        icon: Code,
        gradient: "linear-gradient(135deg, #5A0B4D, #8B5A7A)",
        span: "md:col-span-1",
      },
      {
        title: "Advanced Search",
        description: "Find anything in milliseconds",
        icon: Search,
        gradient: "linear-gradient(135deg, #8B5A7A, #7A3B6A)",
        span: "md:col-span-1",
      },
    ];

export const projects = [
  {
    title: "AI-Powered Analysis",
    description:
      "Advanced ML analyzes context, sentiment, and priority to help you focus on what matters most.",
    link: "#ai-analysis",
  },
  {
    title: "Lightning Fast Processing",
    description:
      "Process thousands of emails in seconds with our optimized AI infrastructure.",
    link: "#performance",
  },
  {
    title: "Semantic Search",
    description:
      "Find emails using natural language queries. Ask questions like 'emails from John about the project'.",
    link: "#search",
  },
  {
    title: "Enterprise Security",
    description:
      "SOC 2, GDPR, and HIPAA compliant with end-to-end encryption and zero-knowledge architecture.",
    link: "#security",
  },
  {
    title: "Smart Responses",
    description:
      "AI-generated responses that match your unique communication style and tone.",
    link: "#responses",
  },
  {
    title: "Time Tracking",
    description:
      "Detailed analytics and insights into your email patterns and productivity metrics.",
    link: "#analytics",
  },
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
    <section className="relative bg-background py-48 overflow-hidden z-15">
      {/* Enhanced sophisticated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-background to-muted/20"></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 10%, rgba(90, 11, 77, 0.04), transparent 60%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 90%, rgba(139, 90, 122, 0.04), transparent 60%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(122, 59, 106, 0.02), transparent 70%)' }}></div>
      
      {/* Enhanced grid overlay with animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="relative mx-auto max-w-8xl px-6 sm:px-8 lg:px-12">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-40"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-semibold text-gray-300 mb-12 tracking-wider uppercase"
          >
                <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #5A0B4D, transparent)' }}></div>
            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Platform Features</span>
            <div className="w-12 h-px" style={{ background: 'linear-gradient(270deg, transparent, #8B5A7A, transparent)' }}></div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-7xl sm:text-8xl lg:text-9xl font-light text-black dark:text-white mb-16 tracking-tight leading-none"
          >
            Enterprise-grade
            <br />
            <motion.span
              initial={{ backgroundPosition: "0% 50%" }}
              whileInView={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="font-normal bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #8B5A7A, #5A0B4D, #7A3B6A)', WebkitBackgroundClip: 'text' }}
              style={{ backgroundSize: "200% auto" }}
            >
              email intelligence
            </motion.span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Advanced AI capabilities that transform how teams manage and respond to email at scale
          </motion.p>
        </motion.div>

        {/* Enhanced Feature Showcase */}
        <div className="space-y-40">
          {/* Hero Feature Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Enhanced Large Feature Card */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="lg:col-span-8 group"
            >
              <div className="relative h-[700px] bg-gradient-to-br from-card/60 via-muted/40 to-background/90 rounded-3xl border border-border p-16 overflow-hidden">
                    {/* Enhanced background effects */}
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(90, 11, 77, 0.08), transparent 70%)' }}></div>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 70%, rgba(139, 90, 122, 0.06), transparent 70%)' }}></div>
                
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  animate={{
                      background: [
                        "linear-gradient(0deg, transparent, rgba(90, 11, 77, 0.1), transparent)",
                        "linear-gradient(90deg, transparent, rgba(139, 90, 122, 0.1), transparent)",
                        "linear-gradient(180deg, transparent, rgba(122, 59, 106, 0.1), transparent)",
                        "linear-gradient(270deg, transparent, rgba(90, 11, 77, 0.1), transparent)",
                      ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-4 mb-12"
                    >
                      <div className="relative">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #5A0B4D, #8B5A7A)' }}>
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl blur-lg opacity-50" style={{ background: 'linear-gradient(135deg, #5A0B4D, #8B5A7A)' }}></div>
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full" style={{ color: '#8B5A7A', backgroundColor: 'rgba(90, 11, 77, 0.1)', borderColor: 'rgba(90, 11, 77, 0.2)', border: '1px solid' }}>
                        Core Intelligence
                      </span>
                    </motion.div>
                    
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-5xl font-light text-black dark:text-white mb-8 leading-tight"
                    >
                      AI Email Assistant
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl"
                    >
                      Your personal AI that learns and adapts to your email patterns, providing contextual insights and automated responses that match your communication style.
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                  >
                        {[
                          { color: "#5A0B4D", text: "Real-time sentiment analysis" },
                          { color: "#8B5A7A", text: "Contextual response generation" },
                          { color: "#7A3B6A", text: "Priority-based organization" },
                        ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group/item hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                            <div className="w-3 h-3 rounded-full shadow-lg group-hover/item:scale-125 transition-transform" style={{ backgroundColor: item.color }}></div>
                        <span className="text-lg font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Smaller Feature Cards */}
            <div className="lg:col-span-4 space-y-10">
              {bentoFeatures.slice(1, 3).map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.3 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="h-[320px] bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-black/70 rounded-3xl border border-gray-700/40 p-10 hover:border-gray-600/60 hover:bg-gray-900/50 transition-all duration-700 overflow-hidden">
                    {/* Card glow effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 rounded-3xl" style={{ background: feature.gradient }}></div>
                    
                    <div className="relative h-full flex flex-col justify-between">
                      <div>
                        <div className="relative inline-flex p-4 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500" style={{ background: feature.gradient }}>
                          <feature.icon className="w-7 h-7 text-white" />
                          <div className="absolute inset-0 rounded-2xl blur-lg opacity-50" style={{ background: feature.gradient }}></div>
                        </div>
                        <h4 className="text-2xl font-medium text-black dark:text-white mb-6 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-400 leading-relaxed text-lg group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Card Hover Effect Demo */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="text-center mb-16">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl font-light text-black dark:text-white mb-6"
              >
                Advanced Capabilities
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Powerful features that set VectorMail apart from the competition
              </motion.p>
            </div>
            <CardHoverEffectDemo />
          </motion.div>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative mt-40"
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-black/90 border border-gray-700/50 p-12 md:p-20 overflow-hidden">
            {/* Enhanced gradient accents */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-600/10 to-transparent blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-600/10 to-transparent blur-3xl pointer-events-none"></div>
            
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-30"
              animate={{
                background: [
                  "linear-gradient(45deg, transparent, rgba(8, 145, 178, 0.1), transparent)",
                  "linear-gradient(135deg, transparent, rgba(5, 150, 105, 0.1), transparent)",
                  "linear-gradient(225deg, transparent, rgba(245, 158, 11, 0.1), transparent)",
                  "linear-gradient(315deg, transparent, rgba(8, 145, 178, 0.1), transparent)",
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="/img.png" 
                  alt="VectorMail Dashboard" 
                  width={700} 
                  height={500}
                  className="w-full h-auto"
                  quality={95}
                  unoptimized={false}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating stats badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="absolute -bottom-6 -right-6 bg-black border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                  <div>
                    <div className="text-3xl font-bold text-white">98%</div>
                    <div className="text-sm text-gray-400">Time saved</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 lg:order-2"
            >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-300">Powered by AI</span>
                  </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white tracking-tight">
                Your AI-powered email command center
              </h2>

              <p className="text-xl text-gray-700 dark:text-gray-400 leading-relaxed">
                Experience email management reimagined. Smart automation, instant search, and intelligent responses—all powered by cutting-edge AI.
              </p>

              <div className="space-y-4">
                {[
                  "Automatically categorize and prioritize every email",
                  "Generate contextual responses in your unique voice",
                  "Never miss critical messages with smart notifications"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 group/item"
                  >
                        <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <span className="text-gray-300 text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_-15px_rgba(255,255,255,0.3)]"
              >
                <span className="text-lg">Start Free Trial</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}