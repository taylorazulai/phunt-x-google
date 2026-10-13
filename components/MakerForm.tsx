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
  ChevronDown,
  Zap,
  Cpu,
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
    presetId?: string,
    notice?: string
  ) => void;
  onSelectPreset: (presetId: string) => void;
  fallbackNotice?: string | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
  generationStep?: number;
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
  onGenerate,
  isGenerating = false,
  generationStep = 1,
}: MakerFormProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "scrape" | "manual">(
    activePresetId ? "presets" : "presets"
  );
  const [scrapeQuery, setScrapeQuery] = useState(competitorName || "");
  const [manualText, setManualText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  // Handle Google Maps Outscraper Scrape
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
      onReviewsLoaded(
        data.reviews,
        data.competitorName,
        data.source,
        undefined,
        data.fallbackNotice
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected network error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Manual Reviews Parse
  const handleManualParse = async () => {
    if (!manualText.trim()) {
      setErrorMsg("Please paste at least one review in the text box.");
      return;
    }

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

  // Handle 1-Click Preset Selection
  const handlePresetClick = (presetId: string) => {
    setErrorMsg(null);
    onSelectPreset(presetId);
  };

  // Remove a specific review from current list
  const handleRemoveReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    onReviewsLoaded(updated, competitorName, "manual");
  };

  const GENERATION_STEPS = [
    "Reading customer complaints with Gemini 3.8 Flash...",
    "Isolating key pain points & authentic quotes...",
    "Drafting high-conversion counter-battlecards & FAQ...",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Fallback Notice Banner */}
      {fallbackNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-200/90 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">Notice: </span>
            <span>{fallbackNotice}</span>
          </div>
        </div>
      )}

      {/* STEP 1 (TOP): Your Brand & Value Advantage */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[11px] font-bold text-zinc-200 border border-zinc-700/60">
            1
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-100">
            Your Brand &amp; Advantage
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Your Product / Challenger Name
            </label>
            <input
              type="text"
              disabled={isGenerating}
              value={challengerName}
              onChange={(e) => setChallengerName(e.target.value)}
              placeholder="e.g. PulseFit Studio, EchoDesk CRM, HiveWork"
              className="w-full rounded-xl border border-zinc-750 bg-zinc-950 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Your Differentiator / Pitch (How You Solve Their Frustrations)
            </label>
            <textarea
              rows={3}
              disabled={isGenerating}
              value={challengerPitch}
              onChange={(e) => setChallengerPitch(e.target.value)}
              placeholder="e.g. Transparent monthly billing, cancel in 1 click without hidden fees, 24/7 human coaches, and 100% equipment uptime guarantee."
              className="w-full rounded-xl border border-zinc-750 bg-zinc-950 p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 transition-colors"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Gemini counters competitor complaints directly using this pitch.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 2 (MIDDLE): Target Competitor & Review Source */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[11px] font-bold text-zinc-200 border border-zinc-700/60">
              2
            </span>
            <h2 className="text-sm sm:text-base font-bold text-zinc-100">
              Competitor &amp; Review Source
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {competitorName ? `Targeting ${competitorName}` : "Select source"}
          </span>
        </div>

        <p className="mt-3 text-xs text-zinc-400">
          We analyze 1–3★ complaints from this competitor so Gemini can counter every objection.
        </p>

        {/* Source Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-zinc-950 p-1 border border-zinc-800">
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setActiveTab("presets")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "presets"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            } disabled:opacity-50`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">1-Click Presets</span>
            <span className="sm:hidden">Presets</span>
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setActiveTab("scrape")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "scrape"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            } disabled:opacity-50`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Scrape</span>
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setActiveTab("manual")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            } disabled:opacity-50`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Manual Paste</span>
          </button>
        </div>

        {/* Tab Content: Presets */}
        {activeTab === "presets" && (
          <div className="mt-4 space-y-2.5">
            <div className="grid grid-cols-1 gap-2">
              {MOCK_PRESETS.map((p) => {
                const isSelected = p.id === activePresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handlePresetClick(p.id)}
                    className={`flex items-start justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-zinc-600 bg-zinc-800/80 shadow-sm ring-1 ring-zinc-500"
                        : "border-zinc-800/90 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900"
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{p.name}</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50">
                          {p.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-400">{p.description}</p>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Zap className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Google Maps */}
        {activeTab === "scrape" && (
          <form onSubmit={handleScrapeSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Competitor Business Name or Google Maps URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isGenerating}
                  value={scrapeQuery}
                  onChange={(e) => setScrapeQuery(e.target.value)}
                  placeholder="e.g. Planet Fitness New York or maps.google.com/..."
                  className="w-full rounded-xl border border-zinc-750 bg-zinc-950 px-3.5 py-2 pl-9 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGenerating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-xs sm:text-sm font-bold text-zinc-900 shadow hover:bg-white transition-colors disabled:opacity-50"
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

        {/* Tab Content: Manual Paste */}
        {activeTab === "manual" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Competitor Name
              </label>
              <input
                type="text"
                disabled={isGenerating}
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                placeholder="e.g. Salesforce or Big-Box Gym"
                className="w-full rounded-xl border border-zinc-750 bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Paste Reviews (Separate with blank lines or &quot;---&quot;)
              </label>
              <textarea
                rows={3}
                disabled={isGenerating}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`"Impossible to cancel my subscription without calling retention."&#10;---&#10;"Charged me $120 extra for seats we never used."`}
                className="w-full rounded-xl border border-zinc-750 bg-zinc-950 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none font-mono disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={handleManualParse}
              disabled={isLoading || isGenerating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing Reviews...</span>
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  <span>Parse &amp; Load Reviews</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* STEP 3 (THE STAR): Prominent Primary CTA Button */}
      <div className="space-y-2">
        {/* Progressive Loading State Tracker */}
        {isGenerating && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-2.5 animate-in fade-in duration-200 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <Cpu className="h-4 w-4 animate-spin text-indigo-400" />
                <span>AI Synthesis Engine Active</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-bold">
                Step {Math.min(generationStep, 3)} of 3
              </span>
            </div>

            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500 ease-out"
                style={{
                  width:
                    generationStep === 1
                      ? "35%"
                      : generationStep === 2
                      ? "70%"
                      : "95%",
                }}
              />
            </div>

            <p className="text-xs text-zinc-300 font-medium animate-pulse">
              {GENERATION_STEPS[Math.min(generationStep - 1, 2)]}
            </p>
          </div>
        )}

        {/* Big Action CTA */}
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={
              isGenerating ||
              reviews.length === 0 ||
              !challengerName.trim() ||
              !challengerPitch.trim()
            }
            className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-4 text-sm sm:text-base font-extrabold shadow-lg shadow-black/40 hover:scale-[1.005] active:scale-[0.995] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-900" />
                <span>Synthesizing Counter-Page...</span>
              </>
            ) : (
              <>
                <span className="text-amber-500 font-black text-lg leading-none">⚡</span>
                <span>GENERATE COUNTER-PAGE WITH GEMINI FLASH</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        )}
        <p className="text-center text-[11px] text-zinc-500">
          Analyzes competitor flaws &amp; builds your high-converting comparison page in ~3 seconds
        </p>
      </div>

      {/* STEP 4 (COLLAPSIBLE DRAWER): Competitor Objections */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsReviewsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-850/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span>
              {reviews.length} Competitor Objections Loaded ({competitorName || "Competitor"})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <span>{isReviewsExpanded ? "Collapse" : "Click to view / edit"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isReviewsExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isReviewsExpanded && (
          <div className="p-3.5 pt-0 border-t border-zinc-800/50 mt-1">
            {reviews.length === 0 ? (
              <p className="py-3 text-center text-xs text-zinc-500">
                No reviews loaded yet. Select a preset or fetch reviews above.
              </p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="group flex items-start justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-2.5 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-300">{rev.author}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i < rev.rating
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-zinc-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                        &quot;{rev.text}&quot;
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleRemoveReview(rev.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity p-1"
                      title="Remove review"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
