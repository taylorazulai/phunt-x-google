"use client";

import React, { useState } from "react";
import { CompetitorReview, ScrapeResponse } from "@/lib/types";
import { MOCK_PRESETS } from "@/lib/mock-data";
import {
  MapPin,
  ClipboardList,
  Sparkles,
  Search,
  Loader2,
  Star,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface MakerFormProps {
  reviews: CompetitorReview[];
  competitorName: string;
  setCompetitorName: (name: string) => void;
  challengerName: string;
  setChallengerName: (name: string) => void;
  challengerPitch: string;
  setChallengerPitch: (pitch: string) => void;
  activePresetId?: string;
  onReviewsLoaded: (
    reviews: CompetitorReview[],
    competitorName: string,
    source: "outscraper" | "preset" | "manual",
    presetId?: string
  ) => void;
  onSelectPreset: (presetId: string) => void;
  fallbackNotice?: string | null;
  onProceedToGenerate?: () => void;
}

export function MakerForm({
  reviews,
  competitorName,
  setCompetitorName,
  challengerName,
  setChallengerName,
  challengerPitch,
  setChallengerPitch,
  activePresetId,
  onReviewsLoaded,
  onSelectPreset,
  fallbackNotice,
  onProceedToGenerate,
}: MakerFormProps) {
  const [activeTab, setActiveTab] = useState<"scrape" | "manual" | "presets">(
    activePresetId ? "presets" : "scrape"
  );
  const [scrapeQuery, setScrapeQuery] = useState(competitorName || "");
  const [manualText, setManualText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab 1: Handle Google Maps Outscraper Scrape
  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeQuery.trim()) {
      setErrorMsg("Please enter a business name or Google Maps place URL.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorQuery: scrapeQuery.trim() }),
      });

      const data: ScrapeResponse = await res.json();

      if (!res.ok && !data.success) {
        throw new Error(data.fallbackNotice || "Failed to fetch competitor reviews");
      }

      setCompetitorName(data.competitorName);
      onReviewsLoaded(data.reviews, data.competitorName, data.source);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected network error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Tab 2: Handle Manual Reviews Parse
  const handleManualParse = async () => {
    if (!manualText.trim()) {
      setErrorMsg("Please paste at least one review in the text box.");
      return;
    }

    // Split by multiple newlines or numbered patterns (e.g. "1. ", "2. ", "---")
    const rawChunks = manualText
      .split(/\n\s*---\s*\n|\n{2,}|\n(?=\d+[\.\)])/)
      .map((c) => c.trim())
      .filter((c) => c.length > 10);

    if (rawChunks.length === 0) {
      setErrorMsg("Could not detect distinct reviews. Separate them with double line breaks or '---'.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualReviews: rawChunks,
          competitorQuery: competitorName.trim() || "Competitor",
        }),
      });

      const data: ScrapeResponse = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.fallbackNotice || "Failed to process manual reviews");
      }

      onReviewsLoaded(data.reviews, competitorName || data.competitorName, "manual");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tab 3: Handle 1-Click Preset Selection
  const handlePresetClick = (presetId: string) => {
    setErrorMsg(null);
    onSelectPreset(presetId);
  };

  // Remove a specific review from current list
  const handleRemoveReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    onReviewsLoaded(updated, competitorName, "manual");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Fallback Notice Banner */}
      {fallbackNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-200 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">Demo Resilience Active: </span>
            <span>{fallbackNotice}</span>
          </div>
        </div>
      )}

      {/* Step 1: Ingestion Intake Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ingest Competitor Reviews
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pull genuine 1–3 star dissatisfaction to uncover the objections your copy must solve.
            </p>
          </div>
        </div>

        {/* Ingestion Source Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("scrape")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "scrape"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Scrape</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Manual Paste</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "presets"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">1-Click Presets</span>
            <span className="sm:hidden">Presets</span>
          </button>
        </div>

        {/* Tab 1 Content: Google Maps Outscraper Form */}
        {activeTab === "scrape" && (
          <form onSubmit={handleScrapeSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Competitor Business Name or Google Maps URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={scrapeQuery}
                  onChange={(e) => setScrapeQuery(e.target.value)}
                  placeholder="e.g. Planet Fitness New York or maps.google.com/..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Outscraper filters automatically for 1, 2, and 3-star reviews.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning 1-3★ Reviews...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Fetch 1–3★ Competitor Reviews</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2 Content: Manual Paste */}
        {activeTab === "manual" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Competitor Name
              </label>
              <input
                type="text"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                placeholder="e.g. Salesforce or Gold's Gym"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste Customer Reviews (Separate with blank lines or &quot;---&quot;)
              </label>
              <textarea
                rows={4}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`"Impossible to cancel my subscription without calling a retention rep."&#10;---&#10;"Charged me $120 extra for basic user seats we never used."`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleManualParse}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing Reviews...</span>
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  <span>Parse & Load Reviews</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3 Content: 1-Click Demo Presets */}
        {activeTab === "presets" && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-400">
              Zero-latency benchmark presets seeded with real competitor reviews:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {MOCK_PRESETS.map((p) => {
                const isSelected = p.id === activePresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetClick(p.id)}
                    className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {p.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{p.description}</p>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Zap className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Extracted Review Reviewer Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Extracted Reviews ({reviews.length})
            </h3>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
              {competitorName || "Competitor"}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {reviews.length > 0 ? "1–3★ Objections" : "No reviews loaded"}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-slate-500">
            Ingest reviews above or click a demo preset to inspect customer complaints.
          </div>
        ) : (
          <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {rev.author}
                    </span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating
                              ? "fill-rose-500 text-rose-500"
                              : "text-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(rev.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                    title="Remove review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;{rev.text}&quot;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Challenger Product Differentiators */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Define Your Challenger Positioning
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Product Name
            </label>
            <input
              type="text"
              value={challengerName}
              onChange={(e) => setChallengerName(e.target.value)}
              placeholder="e.g. PulseFit Studio or EchoDesk"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Core Counter-Pitch & Key Differentiators
            </label>
            <textarea
              rows={3}
              value={challengerPitch}
              onChange={(e) => setChallengerPitch(e.target.value)}
              placeholder="e.g. Transparent monthly billing with 1-click in-app cancellation, capped peak capacity, and 24/7 human coaches."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              The AI engine uses this to counter the specific 1-star complaints above.
            </p>
          </div>

          {onProceedToGenerate && (
            <button
              type="button"
              onClick={onProceedToGenerate}
              disabled={reviews.length === 0 || !challengerName || !challengerPitch}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 transition-all"
            >
              <span>Ready for Stage 3 (AI Copy Engine)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
