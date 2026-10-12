"use client";

import React, { useState } from "react";
import { MOCK_PRESETS } from "@/lib/mock-data";
import { CounterLandingPage } from "@/components/CounterLandingPage";
import { Sparkles, Monitor, Tablet, Smartphone, CheckCircle2 } from "lucide-react";

export default function Stage1VerificationPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_PRESETS[0].id);
  const [previewViewport, setPreviewViewport] = useState<"full" | "tablet" | "mobile">("full");

  const activePreset =
    MOCK_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_PRESETS[0];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Stage 1 Admin / Verification Floating Control Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 shadow-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          {/* Brand & Stage 1 Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-500/20">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  ChallengerPage
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400 border border-emerald-500/20">
                  STAGE 1 VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Foundation & Preset Aesthetic Switcher
              </p>
            </div>
          </div>

          {/* Preset Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">
              Active Preset:
            </span>
            {MOCK_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                      : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Viewport Width Emulation Controls */}
          <div className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-1">
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

        {/* Preset Context Summary Sub-bar */}
        <div className="mx-auto mt-2 flex max-w-7xl items-center justify-between border-t border-slate-850 pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Scenario:</span>
            <span>{activePreset.description}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-500">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Responsive Layout & Contract Validation Ready</span>
          </div>
        </div>
      </header>

      {/* Main Preview Container with optional viewport frame constraint */}
      <main className="flex-1 bg-slate-950 flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            previewViewport === "mobile"
              ? "max-w-[420px] my-6 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-950"
              : previewViewport === "tablet"
              ? "max-w-[820px] my-6 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-950"
              : "max-w-none"
          }`}
        >
          <CounterLandingPage data={activePreset.data} isPreview />
        </div>
      </main>
    </div>
  );
}
