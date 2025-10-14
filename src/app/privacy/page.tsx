import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, User, Database, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - VectorMail",
  description: "Learn how VectorMail protects your privacy and handles your data with enterprise-grade security.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "December 2024";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Email content and metadata for AI processing",
        "Account information (name, email address)",
        "Usage analytics to improve our service",
        "Device and browser information for security"
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Provide AI-powered email management services",
        "Improve our AI models and service quality",
        "Ensure security and prevent fraud",
        "Communicate important service updates"
      ]
    },
    {
      icon: Database,
      title: "Data Storage & Security",
      content: [
        "End-to-end encryption for all email content",
        "Zero-knowledge architecture - we can't read your emails",
        "SOC 2 Type II compliant infrastructure",
        "Regular security audits and updates"
      ]
    },
    {
      icon: Globe,
      title: "Data Sharing",
      content: [
        "We never sell your personal information",
        "No third-party access to your email content",
        "Limited sharing only with your explicit consent",
        "Anonymous usage data for service improvement"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#875276' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Your Privacy Matters</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            At VectorMail, we're committed to protecting your privacy and ensuring the security of your email data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
            AI-powered email management service.
          </p>
        </div>

        {/* Key Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#875276' }}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#875276' }}></div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
            </div>

        {/* Additional Information */}
        <div className="mt-12 bg-muted/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">Your Rights</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have the right to access, update, or delete your personal information at any time. 
            You can also request a copy of your data or opt out of certain data processing activities.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-gray-600 dark:text-gray-400">
              Right to Access
            </span>
            <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-gray-600 dark:text-gray-400">
              Right to Correction
            </span>
            <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-gray-600 dark:text-gray-400">
              Right to Deletion
            </span>
            <span className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-gray-600 dark:text-gray-400">
              Right to Portability
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">Questions About Privacy?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about this Privacy Policy or our data practices, please contact us.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">privacy@vectormail.com</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This Privacy Policy is effective as of {lastUpdated} and may be updated from time to time. 
            We will notify you of any material changes.
          </p>
        </div>
      </div>
    </div>
  );
}
