"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Users, Award, TrendingUp, BarChart3, Clock, CheckCircle2, Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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

  const stats = [
    { label: "Emails Processed Daily", value: "2.5M+", icon: BarChart3 },
    { label: "Time Saved Per User", value: "10+ hrs", icon: Clock },
    { label: "Customer Satisfaction", value: "98%", icon: Award },
    { label: "Active Professionals", value: "50K+", icon: Users },
  ];

  const benefits = [
    {
      title: "Zero Learning Curve",
      description: "Get started in minutes, not hours. Our AI adapts to your style instantly.",
      highlight: "No training required"
    },
    {
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and zero-knowledge architecture.",
      highlight: "Fort Knox security"
    },
    {
      title: "ROI in 7 Days",
      description: "See measurable productivity gains within your first week of usage.",
      highlight: "Immediate impact"
    },
    {
      title: "24/7 AI Assistant",
      description: "Never sleep again. Your AI works around the clock to optimize your inbox.",
      highlight: "Always working"
    }
  ];

  return (
    <section className="relative bg-background py-48 overflow-hidden z-20">
      {/* Enhanced dark background pattern */}
          <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 25% 25%, rgba(90, 11, 77, 0.08), transparent 60%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 75% 75%, rgba(139, 90, 122, 0.06), transparent 60%)' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(122, 59, 106, 0.04), transparent 70%)' }}></div>
          </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 ${i % 4 === 0 ? 'rounded-full' : i % 4 === 1 ? 'rounded-lg' : 'rotate-45'}`}
            style={{
              backgroundColor: i % 3 === 0 ? 'rgba(90, 11, 77, 0.2)' : i % 3 === 1 ? 'rgba(139, 90, 122, 0.2)' : 'rgba(122, 59, 106, 0.2)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      
      <div className="relative mx-auto max-w-8xl px-6 sm:px-8 lg:px-12">
        {/* Unique Asymmetric Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-40"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side - Content */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-12"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Currently in beta - Early access available</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-8 leading-tight -mt-8"
              >
                Stop drowning in
                <br />
                    <span style={{ color: '#5A0B4D' }}>email chaos</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8"
              >
                Join the early adopters who are revolutionizing their email workflow with VectorMail's intelligent AI assistant
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-wrap gap-4"
              >
                {[
                  { text: "No more inbox anxiety", icon: "✓" },
                  { text: "10+ hours saved weekly", icon: "⏰" },
                  { text: "Beta feedback welcome", icon: "💡" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 font-semibold">{item.icon}</span>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Right side - Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
                  <div className="relative rounded-3xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #5A0B4D, #8B5A7A)' }}>
                <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
                <div className="relative">
                  <div className="text-6xl font-bold mb-4">10+ hrs</div>
                  <div className="text-lg opacity-90">Saved per week</div>
                  <div className="mt-6 text-sm opacity-80">
                    "Finally, an AI that actually understands my email style. Game changer for productivity!"
                  </div>
                  <div className="mt-4 text-xs opacity-70">- Early Beta User</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sophisticated Transformation Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-light text-black dark:text-white mb-6">The VectorMail transformation</h3>
            <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto">See how professionals reclaim their time and sanity</p>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            {/* Timeline/Flow Design */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Before State */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-3xl p-8 border border-gray-700/50 h-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-xl font-semibold text-black dark:text-gray-300 mb-2">Before</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-500">Traditional email chaos</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      "3+ hours daily on email",
                      "Important messages buried",
                      "Constant inbox anxiety",
                      "Work-life balance disrupted"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Arrow/Transition */}
              <div className="hidden lg:flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: 'linear-gradient(90deg, #5A0B4D, #8B5A7A)' }}
                    >
                  <ArrowRight className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              {/* After State */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative"
              >
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-3xl p-8 h-full relative overflow-hidden" style={{ borderColor: 'rgba(90, 11, 77, 0.3)', border: '1px solid' }}>
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(90, 11, 77, 0.05), rgba(139, 90, 122, 0.05))' }}></div>
                  
                  <div className="relative">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #5A0B4D, #8B5A7A)' }}>
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-black dark:text-white mb-2">After</h4>
                      <p className="text-sm" style={{ color: '#8B5A7A' }}>AI-powered efficiency</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        "30 minutes daily email time",
                        "Zero missed communications",
                        "Stress-free inbox management",
                        "Perfect work-life balance"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#8B5A7A' }}></div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { label: "Time Saved", value: "10+ hours", icon: Clock },
                { label: "Stress Reduced", value: "85%", icon: TrendingUp },
                { label: "Productivity", value: "3x faster", icon: Zap }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, rgba(90, 11, 77, 0.2), rgba(139, 90, 122, 0.2))' }}>
                    <stat.icon className="w-6 h-6" style={{ color: '#8B5A7A' }} />
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Interactive Feature Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">See VectorMail in action</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300">Experience the AI that transforms your email workflow</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Demo steps */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  step: "01",
                  title: "Connect Your Email",
                  description: "Securely link your Gmail, Outlook, or any email provider in under 2 minutes",
                  icon: "🔗",
                  color: "blue"
                },
                {
                  step: "02", 
                  title: "AI Analyzes Your Style",
                  description: "Our AI learns your writing patterns, tone, and communication preferences",
                  icon: "🧠",
                  color: "purple"
                },
                {
                  step: "03",
                  title: "Smart Suggestions",
                  description: "Get intelligent replies, categorizations, and priority rankings instantly",
                  icon: "✨",
                  color: "green"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-2xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`flex-shrink-0 w-12 h-12 bg-${item.color}-500/20 border border-${item.color}-500/30 rounded-xl flex items-center justify-center text-2xl`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-bold text-${item.color}-400`}>{item.step}</span>
                      <h4 className="text-lg font-semibold text-black dark:text-white">{item.title}</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Right side - Visual mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-300">VectorMail AI</div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-green-400 mb-2">✓ AI Response Generated</div>
                    <div className="text-gray-300 text-sm">
                      "Thanks for reaching out! I'd be happy to discuss this further. When would be a good time to connect?"
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-blue-400 mb-2">📧 Priority: High</div>
                    <div className="text-gray-300 text-sm">
                      "Client follow-up - Requires response within 2 hours"
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-purple-400 mb-2">🏷️ Category: Business</div>
                    <div className="text-gray-300 text-sm">
                      "Meeting request from potential partner"
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Simple & Direct CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
              <div className="rounded-2xl p-12 text-white text-center" style={{ background: 'linear-gradient(90deg, #5A0B4D, #8B5A7A)' }}>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              Ready to reclaim your time?
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl mb-8 opacity-90"
            >
              Join the beta users who are shaping the future of email productivity
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                    className="bg-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                    style={{ color: '#5A0B4D' }}
              >
                Join Beta - Free Access
              </motion.button>
              
              <div className="text-sm opacity-80">
                Beta access • Help shape the product
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
