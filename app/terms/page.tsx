import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | ChallengerPage",
  description: "Terms of service, intellectual property ownership, and fair-use review guidelines for ChallengerPage.",
};

export default function TermsPage() {
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
            <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
            <span className="text-xs text-slate-400">Effective: Oct 12, 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-4xl prose prose-invert prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-p:text-slate-300 prose-p:leading-relaxed">
          <div className="flex items-center gap-3 mb-6 not-prose">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white m-0">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs text-slate-400 m-0 mt-1">
                Your rights, ownership of generated content, and fair-use review guidelines.
              </p>
            </div>
          </div>

          <hr className="border-slate-800 my-8" />

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using ChallengerPage (&ldquo;the Service&rdquo;), generating marketing materials, or exporting code/markdown, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          <h2>2. Service Description & Ownership of Generated Content</h2>
          <p>
            ChallengerPage is an AI-powered conversion copywriting platform that synthesizes publicly available customer feedback and founder value propositions into comparison landing pages.
          </p>
          <div className="not-prose my-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300">100% User Intellectual Property:</strong> You own all rights, title, and interest in and to the landing pages, HTML code, Tailwind templates, and copy you generate and export through ChallengerPage. We claim no royalty or copyright over your published assets.
            </div>
          </div>

          <h2>3. Public Customer Reviews & Fair-Use Disclaimer</h2>
          <p>
            Customer reviews retrieved via public APIs (including Google Maps) represent public consumer opinions.
          </p>
          <ul>
            <li>
              <strong>Authenticity:</strong> ChallengerPage extracts verbatim public review excerpts without fabrication.
            </li>
            <li>
              <strong>User Responsibility:</strong> You are solely responsible for ensuring your published comparison pages comply with applicable local advertising laws, trademark guidelines, and truth-in-advertising standards (including FTC comparative advertising guidelines).
            </li>
          </ul>

          <h2>4. Acceptable Use Policy</h2>
          <p>You agree not to use ChallengerPage to:</p>
          <ul>
            <li>Fabricate defamatory, fraudulent, libelous, or misleading advertising claims.</li>
            <li>Harass, stalk, or dox individual customers or businesses.</li>
            <li>Attempt to bypass rate limits, reverse-engineer proprietary algorithms, or overload our hosting infrastructure.</li>
          </ul>

          <div className="not-prose my-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Disclaimer of Warranties:</strong> The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. ChallengerPage disclaims all warranties, express or implied, regarding conversion rates, business growth, or legal immunity for competitive advertising claims.
            </div>
          </div>

          <h2>5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, ChallengerPage and its creators shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of your use of generated copy or third-party disputes.
          </p>

          <h2>6. Contact & Legal Notices</h2>
          <p>
            Questions regarding these Terms can be addressed to our legal department at:
            <br />
            <code>legal@challengerpage.com</code>
          </p>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; 2026 ChallengerPage. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
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
