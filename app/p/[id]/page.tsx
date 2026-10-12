import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/kv";
import { CounterLandingPage } from "@/components/CounterLandingPage";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const page = await getPage(id);

  if (!page) {
    return {
      title: "Page Not Found | ChallengerPage",
      description: "The requested comparison page could not be found.",
    };
  }

  const title = `Why Switch from ${page.competitorName} to ${page.challengerName} | ChallengerPage`;
  const description =
    page.hero.subheadline ||
    `Compare authentic 1-3 star reviews of ${page.competitorName} against ${page.challengerName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/p/${id}`,
      type: "website",
      siteName: "ChallengerPage",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicCounterPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getPage(id);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Public Attribution & Maker Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-xs text-white">
              CP
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Published Comparison Page
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-2 py-0.5">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Public Review Analysis</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Create Your Own Counter-Page</span>
              <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <CounterLandingPage data={page} isPreview={false} />
      </main>
    </div>
  );
}
