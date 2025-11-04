import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  User,
  Database,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - VectorMail",
  description:
    "Learn how VectorMail protects your privacy and handles your data with enterprise-grade security.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "September 2025";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Email content and metadata for AI processing",
        "Account information (name, email address)",
        "Usage analytics to improve our service",
        "Device and browser information for security",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Provide AI-powered email management services",
        "Improve our AI models and service quality",
        "Ensure security and prevent fraud",
        "Communicate important service updates",
      ],
    },
    {
      icon: Database,
      title: "Data Storage & Security",
      content: [
        "End-to-end encryption for all email content",
        "Zero-knowledge architecture - we can't read your emails",
        "SOC 2 Type II compliant infrastructure",
        "Regular security audits and updates",
      ],
    },
    {
      icon: Globe,
      title: "Data Sharing",
      content: [
        "We never sell your personal information",
        "No third-party access to your email content",
        "Limited sharing only with your explicit consent",
        "Anonymous usage data for service improvement",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#875276" }}
            >
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
            Your Privacy Matters
          </h2>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            At VectorMail, we're committed to protecting your privacy and
            ensuring the security of your email data. This Privacy Policy
            explains how we collect, use, and safeguard your information when
            you use our AI-powered email management service.
          </p>
        </div>

        {/* Key Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#875276" }}
                >
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div
                      className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: "#875276" }}
                    ></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 rounded-2xl bg-muted/30 p-8">
          <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
            Your Rights
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You have the right to access, update, or delete your personal
            information at any time. You can also request a copy of your data or
            opt out of certain data processing activities.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Right to Access
            </span>
            <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Right to Correction
            </span>
            <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Right to Deletion
            </span>
            <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Right to Portability
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
            Questions About Privacy?
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            If you have any questions about this Privacy Policy or our data
            practices, please contact us.
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              help@productsolution.net
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This Privacy Policy is effective as of {lastUpdated} and may be
            updated from time to time. We will notify you of any material
            changes.
          </p>
        </div>
      </div>
    </div>
  );
}
