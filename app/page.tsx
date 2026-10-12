"use client";

import React, { useState, useRef } from "react";
import { MOCK_PRESETS, getPresetReviews } from "@/lib/mock-data";
import { CompetitorReview, ChallengerPageData } from "@/lib/types";
import { CounterLandingPage } from "@/components/CounterLandingPage";
import { MakerForm } from "@/components/MakerForm";
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Columns,
  Layers,
  RotateCw,
  Cpu,
} from "lucide-react";

export default function Stage3StudioPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_PRESETS[0].id);
  const activePreset =
    MOCK_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_PRESETS[0];

  // Maker intake state
  const [reviews, setReviews] = useState<CompetitorReview[]>(
    getPresetReviews(activePreset.id)
  );
  const [competitorName, setCompetitorName] = useState<string>(
    activePreset.data.competitorName
  );
  const [challengerName, setChallengerName] = useState<string>(
    activePreset.data.challengerName
  );
  const [challengerPitch, setChallengerPitch] = useState<string>(
    "No hidden cancellation fees, capped member capacity per hour, and 100% commercial-grade equipment uptime guarantee."
  );
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  // Stage 3 Generation State
  const [generatedPageData, setGeneratedPageData] = useState<ChallengerPageData | null>(null);
  const [generationModel, setGenerationModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // View & responsive emulation state
  const [previewViewport, setPreviewViewport] = useState<"full" | "tablet" | "mobile">("full");
  const [activeLayoutView, setActiveLayoutView] = useState<"split" | "form" | "preview">("split");

  // Handler when reviews are loaded via scrape, manual paste, or preset
  const handleReviewsLoaded = (
    newReviews: CompetitorReview[],
    compName: string,
    source: "outscraper" | "preset" | "manual",
    presetId?: string
  ) => {
    setReviews(newReviews);
    if (compName) setCompetitorName(compName);
    if (presetId) {
      setSelectedPresetId(presetId);
    }
    // Reset previously generated AI page when reviews or competitor changes
    setGeneratedPageData(null);
    setGenerationModel(null);

    if (source === "preset" && !presetId) {
      setFallbackNotice(
        "Using pre-scraped verified reviews. Provide an Outscraper API key in .env for live searches."
      );
    } else {
      setFallbackNotice(null);
    }
  };

  // Handler for 1-click preset selector
  const handleSelectPreset = (presetId: string) => {
    const preset = MOCK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setCompetitorName(preset.data.competitorName);
    setChallengerName(preset.data.challengerName);
    setReviews(getPresetReviews(preset.id));
    setGeneratedPageData(null);
    setGenerationModel(null);
    setFallbackNotice(null);

    if (preset.id === "preset-gym-pulsefit") {
      setChallengerPitch(
        "1-Click in-app cancellation, capped 35-athlete workout blocks, and dedicated floor coaches on duty."
      );
    } else if (preset.id === "preset-crm-echodesk") {
      setChallengerPitch(
        "Month-to-month fair billing at $29/seat with pre-built pipelines that go live in 15 minutes."
      );
    } else if (preset.id === "preset-coworking-hivework") {
      setChallengerPitch(
        "Symmetric 1 Gbps fiber with dual failover, free craft coffee & printing, and flexible 30-day notice leases."
      );
    }
  };

  // Stage 3: Generation Pipeline Trigger
  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationStep(1);

    // Animate through progressive generation steps
    let currentStep = 1;
    stepIntervalRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 3) {
        setGenerationStep(currentStep);
      }
    }, 1100);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorName: competitorName.trim(),
          challengerName: challengerName.trim(),
          challengerPitch: challengerPitch.trim(),
          reviews,
        }),
      });

      const result = await res.json();

      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

      if (result.success && result.data) {
        setGeneratedPageData(result.data);
        setGenerationModel(result.modelUsed || "Gemini 3.8 Flash");
        if (result.notice) {
          setFallbackNotice(result.notice);
        } else {
          setFallbackNotice(null);
        }

        // Auto switch to split view so the newly generated counter page is immediately visible
        setActiveLayoutView("split");
      } else {
        setFallbackNotice(result.error || "Failed to generate counter-page");
      }
    } catch (err: unknown) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setFallbackNotice(
        err instanceof Error ? err.message : "Generation network error occurred"
      );
    } finally {
      setIsGenerating(false);
      setGenerationStep(1);
    }
  };

  // Active display data: Prioritizes AI generated data, falls back to live reactive preset
  const displayPageData: ChallengerPageData = generatedPageData || {
    ...activePreset.data,
    competitorName: competitorName || activePreset.data.competitorName,
    challengerName: challengerName || activePreset.data.challengerName,
    hero: {
      ...activePreset.data.hero,
      badge: `Tired of ${competitorName || activePreset.data.competitorName}'s Hidden Clauses?`,
      headline: activePreset.data.hero.headline,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Floating Control Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 shadow-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Stage Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-indigo-700 font-bold text-white shadow-md shadow-indigo-500/20">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  ChallengerPage
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400 border border-emerald-500/20">
                  STAGE 3 ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gemini 3.8 / 3.6 Flash Objection Synthesis Engine
              </p>
            </div>
          </div>

          {/* Model Badge & Quick Regenerate CTA */}
          <div className="flex items-center gap-2">
            {generationModel ? (
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3 py-1 text-xs text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span className="font-semibold">{generationModel}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-slate-400" />
                <span>Engine: Gemini 3.8 Flash (Fallback: 3.6 Flash)</span>
              </div>
            )}

            {generatedPageData && (
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Regenerate copy with new variations"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>Regenerate Copy</span>
              </button>
            )}
          </div>

          {/* Layout Mode Switcher (Split / Form / Preview) */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveLayoutView("split")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeLayoutView === "split"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayoutView("form")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeLayoutView === "form"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Intake Form</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayoutView("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeLayoutView === "preview"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview Only</span>
            </button>
          </div>

          {/* Viewport Width Emulation Controls */}
          <div className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              type="button"
              onClick={() => setPreviewViewport("full")}
              title="Full Width Viewport"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                previewViewport === "full"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Full</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("tablet")}
              title="Tablet Width (768px)"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                previewViewport === "tablet"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              title="Mobile Width (390px)"
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                previewViewport === "mobile"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Active Context Information Bar */}
        <div className="mx-auto mt-2 flex max-w-7xl items-center justify-between border-t border-slate-850 pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Target Competitor:</span>
            <span className="text-rose-400 font-semibold">{competitorName}</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-300">Challenger:</span>
            <span className="text-indigo-400 font-semibold">{challengerName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{reviews.length} reviews loaded</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-500">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>
              {generatedPageData
                ? "Live AI copy generated & objection-matched"
                : "Awaiting generation trigger"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {activeLayoutView === "split" ? (
            /* Split View: Left Intake Form, Right Live Preview */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Maker Form (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-6">
                <MakerForm
                  reviews={reviews}
                  competitorName={competitorName}
                  setCompetitorName={setCompetitorName}
                  challengerName={challengerName}
                  setChallengerName={setChallengerName}
                  challengerPitch={challengerPitch}
                  setChallengerPitch={setChallengerPitch}
                  activePresetId={selectedPresetId}
                  onReviewsLoaded={handleReviewsLoaded}
                  onSelectPreset={handleSelectPreset}
                  fallbackNotice={fallbackNotice}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  generationStep={generationStep}
                />
              </div>

              {/* Right Column: Live Landing Page Preview (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Counter-Landing Page Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {generatedPageData ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        AI Copy Active
                      </span>
                    ) : (
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20">
                        Preview Draft
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`mx-auto rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950 transition-all duration-300 ${
                    previewViewport === "mobile"
                      ? "max-w-[400px]"
                      : previewViewport === "tablet"
                      ? "max-w-[768px]"
                      : "w-full"
                  }`}
                >
                  <CounterLandingPage data={displayPageData} isPreview />
                </div>
              </div>
            </div>
          ) : activeLayoutView === "form" ? (
            /* Form Only View (Centered) */
            <div className="max-w-3xl mx-auto py-4">
              <MakerForm
                reviews={reviews}
                competitorName={competitorName}
                setCompetitorName={setCompetitorName}
                challengerName={challengerName}
                setChallengerName={setChallengerName}
                challengerPitch={challengerPitch}
                setChallengerPitch={setChallengerPitch}
                activePresetId={selectedPresetId}
                onReviewsLoaded={handleReviewsLoaded}
                onSelectPreset={handleSelectPreset}
                fallbackNotice={fallbackNotice}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                generationStep={generationStep}
              />
            </div>
          ) : (
            /* Preview Only View */
            <div className="flex justify-center py-4">
              <div
                className={`w-full transition-all duration-300 ${
                  previewViewport === "mobile"
                    ? "max-w-[420px] rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden"
                    : previewViewport === "tablet"
                    ? "max-w-[820px] rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden"
                    : "max-w-none"
                }`}
              >
                <CounterLandingPage data={displayPageData} isPreview />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
