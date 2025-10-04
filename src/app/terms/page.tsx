import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - VectorMail AI",
  description: "Terms & Conditions for VectorMail AI - AI-powered email management platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <p className="text-muted-foreground mb-8">
            Welcome, if you continue to browse and use this website you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern VectorMail AI's relationship with you in relation to this website.
          </p>

          <p className="text-muted-foreground mb-8">
            The term 'VectorMail AI' or 'us' or 'we' refers to the owner of the website. The term 'you' refers to the user or viewer of our website.
          </p>

          <p className="text-muted-foreground mb-8">
            The use of this website is subject to the following terms of use:
          </p>

          <div className="space-y-6">
            <section>
              <p className="mb-4">
                <strong>1.</strong> The content of the pages of this website is for your general information and use only. It is subject to change without notice.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>2.</strong> Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>3.</strong> You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>4.</strong> Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>5.</strong> It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>6.</strong> This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>7.</strong> Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>8.</strong> All trademarks reproduced in this website which is not the property of, or licensed to, the operator is acknowledged on the website.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>9.</strong> Unauthorized use of this website by you may give rise to a claim for damages and/or be a criminal offense. From time to time this website may also include links to other websites.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>10.</strong> These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We take no responsibility for the content of the linked website(s).
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>11.</strong> You may not create a link to this website from another website or document without VectorMail AI's prior consent. Your use of this website and any dispute arising out of such use of the website is subject to the laws of the United States or other regulatory authority.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>12.</strong> Other Terms: Credit Card orders will commence on receiving the authorization/confirmation from the Credit Card/respective Payment Gateway companies.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>13.</strong> AI-Powered Services: VectorMail AI provides artificial intelligence-powered email management services. You acknowledge that AI-generated content may not always be accurate and should be reviewed before use.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>14.</strong> Email Integration: By connecting your email account, you grant VectorMail AI permission to access and process your email data for the purpose of providing our AI-powered services. You can revoke this access at any time.
              </p>
            </section>

            <section>
              <p className="mb-4">
                <strong>15.</strong> Data Security: We implement industry-standard security measures to protect your data, but you acknowledge that no method of transmission over the internet is 100% secure.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="mb-2"><strong>Email:</strong> legal@vectormail-ai.com</p>
            <p className="mb-2"><strong>Website:</strong> https://vectormail.parbhat.dev</p>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
