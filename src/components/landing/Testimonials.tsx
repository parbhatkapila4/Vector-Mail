"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechCorp",
    image: "SC",
    content: "VectorMail cut my email time by 70%. The AI responses are scarily good—clients think I'm replying personally.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "CEO",
    company: "StartupXYZ",
    image: "MJ",
    content: "Best investment we made this year. Our team saves 10+ hours weekly. The ROI is insane.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Engineering Lead",
    company: "DevTools Inc",
    image: "ER",
    content: "Finally, an email tool that actually works. Smart search finds anything in seconds. Game changer.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-white py-32 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 backdrop-blur-xl border border-black/10 mb-8"
          >
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Loved by thousands</span>
          </motion.div>
          
          <h2 className="text-5xl sm:text-6xl font-bold text-black mb-6 tracking-tight">
            What users are saying
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who transformed their workflow
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative bg-gradient-to-b from-black/5 to-black/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-black/10 hover:border-black/20 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-black" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-black">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "10K+", label: "Happy Users" },
            { value: "98%", label: "Would Recommend" },
            { value: "24/7", label: "Support" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-black mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
