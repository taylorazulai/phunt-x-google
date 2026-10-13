"use client";

import React, { useState, useRef } from "react";
import { MOCK_PRESETS, getPresetReviews } from "@/lib/mock-data";
import { CompetitorReview, ChallengerPageData } from "@/lib/types";
import { CounterLandingPage } from "@/components/CounterLandingPage";
import { MakerForm } from "@/components/MakerForm";
import { ActionToolbar } from "@/components/ActionToolbar";
import Link from "next/link";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Columns,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ChallengerStudioPage() {
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

  // Generation State
  const [generatedPageData, setGeneratedPageData] = useState<ChallengerPageData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stage 4/5 Inline Editing & Viewport State
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [previewViewport, setPreviewViewport] = useState<"full" | "tablet" | "mobile">("full");

  // Core UX Requirement 4: Default arrival view mode is focused "intake"
  const [activeLayoutView, setActiveLayoutView] = useState<"intake" | "preview" | "split">("intake");

  // Handler when reviews are loaded via scrape, manual paste, or preset
  const handleReviewsLoaded = (
    newReviews: CompetitorReview[],
    compName: string,
    source: "outscraper" | "preset" | "manual" | "fallback",
    presetId?: string,
    notice?: string
  ) => {
    setReviews(newReviews);
    if (compName) setCompetitorName(compName);
    if (presetId) {
      setSelectedPresetId(presetId);
    }
    setGeneratedPageData(null);

    if (notice) {
      setFallbackNotice(notice);
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

  // Generation Pipeline Trigger
  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationStep(1);

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
        if (result.notice) {
          setFallbackNotice(result.notice);
        } else {
          setFallbackNotice(null);
        }

        // Core UX Requirement 4: Auto-glide into "preview" on successful generation!
        setActiveLayoutView("preview");
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

  // Active display data: Prioritizes AI generated data, falls back to reactive preset
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

  const handlePageUpdate = (updated: ChallengerPageData) => {
    setGeneratedPageData(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Core UX Requirement 3: Streamlined Single-Row Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 py-2.5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left: Clean Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-white">
              <span className="text-amber-400 font-black text-base">⚡</span>
              <span>ChallengerPage</span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              Landing Page Engine
            </span>
          </div>

          {/* Center: View Switcher (Intake Form -> Preview Only -> Split View) */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveLayoutView("intake")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeLayoutView === "intake"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
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
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview Only</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayoutView("split")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeLayoutView === "split"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
          </div>

          {/* Right: Viewport switchers & discreet engine indicator */}
          <div className="flex items-center gap-2">
            {/* Viewport switchers (only visible when in Preview or Split mode) */}
            {activeLayoutView !== "intake" && (
              <div className="hidden lg:flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("full")}
                  title="Full Width Viewport"
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    previewViewport === "full"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("tablet")}
                  title="Tablet Width (768px)"
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    previewViewport === "tablet"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  title="Mobile Width (390px)"
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    previewViewport === "mobile"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            )}

            {/* Discreet info pill (replaces noisy debug badges) */}
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-400">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Gemini 3.8 Flash • v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 bg-zinc-950 p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-7xl">
          {activeLayoutView === "intake" ? (
            /* Core UX Requirement 4: Focused Arrival Intake Form */
            <div className="max-w-2xl mx-auto py-2 sm:py-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Turn Competitor Complaints into Your Counter-Page
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                  Target verified 1–3★ customer grievances and position your product as the obvious, objection-free alternative.
                </p>
              </div>

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
          ) : activeLayoutView === "preview" ? (
            /* Preview Only View with Action Toolbar */
            <div className="flex flex-col items-center gap-4 py-2 max-w-5xl mx-auto w-full">
              <div className="w-full">
                <ActionToolbar
                  pageData={displayPageData}
                  isEditable={isEditable}
                  onToggleEditable={() => setIsEditable((prev) => !prev)}
                />
              </div>

              <div
                className={`w-full transition-all duration-300 ${
                  previewViewport === "mobile"
                    ? "max-w-[420px] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
                    : previewViewport === "tablet"
                    ? "max-w-[820px] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
                    : "max-w-none"
                }`}
              >
                <CounterLandingPage
                  data={displayPageData}
                  isPreview
                  isEditable={isEditable}
                  onUpdate={handlePageUpdate}
                />
              </div>
            </div>
          ) : (
            /* Split View: Left Intake Form, Right Live Preview */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Intake Form (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-4">
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
                <ActionToolbar
                  pageData={displayPageData}
                  isEditable={isEditable}
                  onToggleEditable={() => setIsEditable((prev) => !prev)}
                />

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Live Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditable && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/20">
                        Editing Active
                      </span>
                    )}
                    {generatedPageData ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Copy Active</span>
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-700/50">
                        Preset Draft
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`mx-auto rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden bg-zinc-950 transition-all duration-300 ${
                    previewViewport === "mobile"
                      ? "max-w-[400px]"
                      : previewViewport === "tablet"
                      ? "max-w-[768px]"
                      : "w-full"
                  }`}
                >
                  <CounterLandingPage
                    data={displayPageData}
                    isPreview
                    isEditable={isEditable}
                    onUpdate={handlePageUpdate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500 bg-zinc-950">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ChallengerPage • AI-Powered Counter-Landing Page Studio</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-zinc-800">•</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
