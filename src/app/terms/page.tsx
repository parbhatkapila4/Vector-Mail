import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - VectorMail AI",
  description: "Terms of Service for VectorMail AI - AI-powered email management platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using VectorMail AI, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                VectorMail AI is an AI-powered email management platform that provides intelligent 
                email organization, summarization, and search capabilities. Our service integrates 
                with Gmail to offer enhanced email management features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To use our service, you must create an account and provide accurate, complete information. 
                You are responsible for maintaining the confidentiality of your account and password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to use VectorMail AI to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Transmit any harmful or malicious content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="mb-4">
                The service and its original content, features, and functionality are owned by VectorMail AI 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain high service availability, but we do not guarantee that the service 
                will be uninterrupted or error-free. We reserve the right to modify or discontinue the 
                service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall VectorMail AI be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, or 
                other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and access to the service immediately, without 
                prior notice or liability, for any reason whatsoever, including without limitation if you 
                breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new 
                terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="bg-muted p-6 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> legal@vectormail-ai.com</p>
                <p className="mb-2"><strong>Website:</strong> https://vectormail-ai.vercel.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
