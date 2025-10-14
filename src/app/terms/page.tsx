import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - VectorMail",
  description: "Read VectorMail's Terms of Service to understand your rights and responsibilities when using our AI email management platform.",
};

export default function TermsOfService() {
  const lastUpdated = "December 2024";

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        "By using VectorMail, you agree to be bound by these Terms of Service",
        "You must be at least 18 years old to use our service",
        "These terms apply to all users, including beta participants",
        "Continued use constitutes acceptance of any updates to these terms"
      ]
    },
    {
      icon: FileText,
      title: "Service Description",
      content: [
        "VectorMail provides AI-powered email management and organization",
        "We offer intelligent email analysis, smart responses, and semantic search",
        "Our service is currently in beta and may have limitations",
        "Features and functionality may change during the beta period"
      ]
    },
    {
      icon: AlertTriangle,
      title: "User Responsibilities",
      content: [
        "Provide accurate information when creating your account",
        "Maintain the security of your login credentials",
        "Use the service in compliance with applicable laws and regulations",
        "Do not attempt to reverse engineer or exploit our systems"
      ]
    },
    {
      icon: Scale,
      title: "Limitations & Disclaimers",
      content: [
        "Service availability is not guaranteed during beta testing",
        "AI-generated content should be reviewed before sending",
        "We are not responsible for email delivery issues outside our control",
        "Beta users should not rely on the service for critical communications"
      ]
    }
  ];

  const prohibitedUses = [
    "Spam or unsolicited commercial communications",
    "Harassment, abuse, or illegal activities",
    "Attempting to gain unauthorized access to our systems",
    "Violating any applicable laws or regulations",
    "Impersonating others or providing false information",
    "Distributing malware or harmful content"
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Terms of Service</h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Welcome to VectorMail</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These Terms of Service ("Terms") govern your use of VectorMail's AI-powered email management platform. 
            Please read these terms carefully before using our service. By accessing or using VectorMail, 
            you agree to be bound by these Terms.
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

        {/* Prohibited Uses */}
        <div className="mt-12 bg-muted/30 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#875276' }}>
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">Prohibited Uses</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You agree not to use VectorMail for any of the following prohibited activities:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prohibitedUses.map((use, index) => (
              <div key={index} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">{use}</span>
              </div>
            ))}
          </div>
          </div>

        {/* Beta Program */}
        <div className="mt-12 bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">Beta Program Terms</h3>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              VectorMail is currently in beta testing. By participating in our beta program, you acknowledge that:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#875276' }}></div>
                <span className="text-gray-600 dark:text-gray-400">The service may contain bugs, errors, or limitations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#875276' }}></div>
                <span className="text-gray-600 dark:text-gray-400">Features may change or be removed without notice</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#875276' }}></div>
                <span className="text-gray-600 dark:text-gray-400">We may collect feedback and usage data to improve the service</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#875276' }}></div>
                <span className="text-gray-600 dark:text-gray-400">Beta access is provided at no cost and may be terminated at any time</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">Questions About These Terms?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about these Terms of Service, please contact us.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">legal@vectormail.com</span>
          </div>
          </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            These Terms of Service are effective as of {lastUpdated} and may be updated from time to time. 
            We will notify you of any material changes.
          </p>
        </div>
      </div>
    </div>
  );
}
