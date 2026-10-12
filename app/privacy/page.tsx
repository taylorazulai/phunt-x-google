import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ChallengerPage",
  description: "Learn how ChallengerPage collects, protects, and respects your contact and usage data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-4 sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to ChallengerPage Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">Effective: Oct 12, 2026</span>
          </div>
        </div>
      </header>

      {/* Main Legal Content */}
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-4xl prose prose-invert prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-p:text-slate-300 prose-p:leading-relaxed">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white m-0">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 m-0 mt-1">
                Transparency in data collection, zero financial tracking, and full user control.
              </p>
            </div>
          </div>

          <hr className="border-slate-800 my-8" />

          <h2>1. Information We Collect</h2>
          <p>
            ChallengerPage (&ldquo;we&rdquo;, &ldquo;our&rdquo;) prioritizes a value-first, ungated product experience. We only collect basic contact information when you intentionally export or publish a comparison landing page:
          </p>
          <ul>
            <li>
              <strong>Contact Details:</strong> Your First Name, Last Name, and Work Email address provided when copying code or publishing public links.
            </li>
            <li>
              <strong>Input Parameters:</strong> Business names, competitor search queries, founder product pitches, and publicly available review quotes entered into the generator.
            </li>
            <li>
              <strong>Technical Logs:</strong> Standard request logs including IP address, user agent, browser configuration, and access timestamps to protect against abuse and bot attacks.
            </li>
          </ul>
          <div className="not-prose my-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs text-indigo-200 flex items-start gap-3">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong>Zero Financial Collection:</strong> We do not collect credit cards, billing addresses, bank account credentials, or sensitive personal demographic data.
            </div>
          </div>

          <h2>2. How We Use Your Information</h2>
          <p>We use captured data exclusively to:</p>
          <ul>
            <li>Deliver your generated counter-landing pages (hosted at <code>/p/[id]</code>, standalone Tailwind HTML, and Markdown exports).</li>
            <li>Send product updates, feature releases, and counter-positioning benchmarks (you may unsubscribe at any time).</li>
            <li>Maintain service availability and prevent automated abuse of our generative APIs.</li>
          </ul>

          <h2>3. Data Storage & Sub-Processors</h2>
          <p>
            Your information is stored securely in compliant enterprise infrastructure. We rely on the following vetted third-party sub-processors:
          </p>
          <ul>
            <li>
              <strong>Upstash Redis:</strong> Encrypted cloud key-value store for page hosting and lead persistence.
            </li>
            <li>
              <strong>Google Cloud & Gemini 3.8 / 3.6 Flash:</strong> LLM reasoning engine used to synthesize review complaints and counter-pitches.
            </li>
            <li>
              <strong>Outscraper API:</strong> Retrieval of public Google Maps customer reviews.
            </li>
          </ul>

          <h2>4. Data Retention & Your Rights (GDPR & CAN-SPAM)</h2>
          <p>
            You hold total control over your information. At any time, you have the right to:
          </p>
          <ul>
            <li>Unsubscribe from promotional emails via the one-click unsubscribe link.</li>
            <li>Request a copy of your stored records.</li>
            <li>Request permanent deletion of your contact information and all published landing pages.</li>
          </ul>
          <p>
            To exercise any of these rights, contact our privacy officer directly at:
          </p>
          <div className="not-prose my-4 rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3 text-xs text-slate-300">
            <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>
              Direct Privacy Inquiries:{" "}
              <a href="mailto:privacy@challengerpage.com" className="text-indigo-400 font-semibold hover:underline">
                privacy@challengerpage.com
              </a>
            </span>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; 2026 ChallengerPage. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Maker Studio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
