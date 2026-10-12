"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChallengerPageData } from "@/lib/types";
import { DynamicIcon } from "@/components/DynamicIcon";
import {
  Check,
  X,
  Star,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Quote,
  Pencil,
} from "lucide-react";

interface CounterLandingPageProps {
  data: ChallengerPageData;
  isPreview?: boolean;
  isEditable?: boolean;
  onUpdate?: (updated: ChallengerPageData) => void;
}

export function CounterLandingPage({
  data,
  isEditable = false,
  onUpdate,
}: CounterLandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const updateField = (updater: (prev: ChallengerPageData) => ChallengerPageData) => {
    if (!onUpdate) return;
    const updated = updater(data);
    onUpdate(updated);
  };

  const handleHeadlineBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const text = e.currentTarget.textContent?.trim();
    if (text && text !== data.hero.headline) {
      updateField((prev) => ({
        ...prev,
        hero: { ...prev.hero, headline: text },
      }));
    }
  };

  const handleSubheadlineBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const text = e.currentTarget.textContent?.trim();
    if (text && text !== data.hero.subheadline) {
      updateField((prev) => ({
        ...prev,
        hero: { ...prev.hero, subheadline: text },
      }));
    }
  };

  const handleCounterPitchBlur = (
    index: number,
    e: React.FocusEvent<HTMLParagraphElement>
  ) => {
    const text = e.currentTarget.textContent?.trim();
    if (text && text !== data.battlecards[index]?.counterPitch) {
      updateField((prev) => {
        const nextCards = [...prev.battlecards];
        if (nextCards[index]) {
          nextCards[index] = { ...nextCards[index], counterPitch: text };
        }
        return { ...prev, battlecards: nextCards };
      });
    }
  };

  const handleFinalCtaBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const text = e.currentTarget.textContent?.trim();
    if (text && text !== data.finalCta.headline) {
      updateField((prev) => ({
        ...prev,
        finalCta: { ...prev.finalCta, headline: text },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Announcement Banner */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-2.5 text-center text-xs md:text-sm font-semibold text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-200" />
          <span>
            Switching from{" "}
            <span className="underline decoration-white/70 font-bold">
              {data.competitorName}
            </span>
            ? Claim our 14-day risk-free migration offer today.
          </span>
          <ArrowRight className="hidden sm:inline-block h-3.5 w-3.5" />
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[480px] w-[640px] -translate-y-1/4 rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="h-[360px] w-[500px] translate-x-1/3 translate-y-1/4 rounded-full bg-rose-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-indigo-300 shadow-sm backdrop-blur-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{data.hero.badge}</span>
          </div>

          {/* Headline (Inline Editable) */}
          <div className="relative group/edit">
            <h1
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={handleHeadlineBlur}
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-[1.15] ${
                isEditable
                  ? "outline-none border border-dashed border-indigo-400/40 hover:border-indigo-400 focus:border-indigo-400 focus:bg-indigo-950/30 rounded-xl px-2 py-1 transition-all cursor-text"
                  : ""
              }`}
            >
              {data.hero.headline}
            </h1>
            {isEditable && (
              <span className="pointer-events-none absolute -top-3 right-4 hidden group-hover/edit:flex items-center gap-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                <Pencil className="h-2.5 w-2.5" /> Edit
              </span>
            )}
          </div>

          {/* Subheadline (Inline Editable) */}
          <div className="relative group/edit mt-6">
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={handleSubheadlineBlur}
              className={`text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed ${
                isEditable
                  ? "outline-none border border-dashed border-indigo-400/40 hover:border-indigo-400 focus:border-indigo-400 focus:bg-indigo-950/30 rounded-xl px-2 py-1 transition-all cursor-text"
                  : ""
              }`}
            >
              {data.hero.subheadline}
            </p>
            {isEditable && (
              <span className="pointer-events-none absolute -top-3 right-4 hidden group-hover/edit:flex items-center gap-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                <Pencil className="h-2.5 w-2.5" /> Edit
              </span>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <span>{data.hero.ctaPrimary}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {data.hero.ctaSecondary && (
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4 text-base font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <span>{data.hero.ctaSecondary}</span>
              </button>
            )}
          </div>

          {/* Social Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero cancellation headaches</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-indigo-400" />
              <span>Verified 1-click migration</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Authentic public review insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pain Points Battlecards (The Core Hook) */}
      <section className="relative py-16 md:py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800/50 rounded-full px-3 py-1 mb-3">
              Unfiltered Customer Reality
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Customers Are Leaving {data.competitorName}
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Real 1-star complaints from verified public reviews side-by-side with how{" "}
              <span className="text-indigo-400 font-semibold">{data.challengerName}</span> solves them permanently.
            </p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {data.battlecards.map((card, index) => (
              <div
                key={card.id || index}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/40 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-950/30"
              >
                {/* Header Category & Icon */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <DynamicIcon name={card.iconName} className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Issue #{index + 1}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                    {card.painPointCategory}
                  </span>
                </div>

                {/* Competitor Review Box (Negative) */}
                <div className="mt-5 rounded-xl border border-rose-950 bg-rose-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      {data.competitorName} Review
                    </span>
                    <div className="flex text-rose-400" title="1-Star Rating">
                      <Star className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                      <Star className="h-3.5 w-3.5 text-slate-700" />
                      <Star className="h-3.5 w-3.5 text-slate-700" />
                      <Star className="h-3.5 w-3.5 text-slate-700" />
                      <Star className="h-3.5 w-3.5 text-slate-700" />
                    </div>
                  </div>
                  <div className="relative pl-3 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    <Quote className="absolute -left-1 -top-1 h-3 w-3 text-rose-500/40" />
                    {card.competitorQuote}
                  </div>
                </div>

                {/* Challenger Counter-Pitch (Positive Resolution - Inline Editable) */}
                <div className="mt-5 flex-1 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 relative group/cardedit">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>How {data.challengerName} Solves This</span>
                    </div>
                    {isEditable && (
                      <span className="pointer-events-none hidden group-hover/cardedit:flex items-center gap-1 text-[10px] text-indigo-300 font-bold">
                        <Pencil className="h-2.5 w-2.5" /> Edit
                      </span>
                    )}
                  </div>
                  <p
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleCounterPitchBlur(index, e)}
                    className={`text-xs sm:text-sm text-slate-200 font-medium leading-relaxed ${
                      isEditable
                        ? "outline-none border border-dashed border-emerald-400/40 hover:border-emerald-400 focus:border-emerald-400 focus:bg-emerald-950/40 rounded-lg p-1.5 transition-all cursor-text"
                        : ""
                    }`}
                  >
                    {card.counterPitch}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Comparison Matrix Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Head-to-Head Comparison
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              See how the experience stacks up across the metrics that truly impact your day.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="py-4 px-6 text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider w-1/3">
                      Feature / Standard
                    </th>
                    <th className="py-4 px-6 text-xs sm:text-sm font-semibold text-rose-400/90 uppercase tracking-wider w-1/3 border-l border-slate-800 bg-rose-950/10">
                      {data.competitorName}
                    </th>
                    <th className="py-4 px-6 text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider w-1/3 border-l border-slate-800 bg-indigo-950/30">
                      {data.challengerName}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {data.comparisonMatrix.map((row, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-slate-850/50"
                    >
                      <td className="py-4 px-6 font-medium text-slate-200">
                        {row.featureOrCapability}
                      </td>
                      <td className="py-4 px-6 text-slate-300 border-l border-slate-800 bg-rose-950/5">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                            <X className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span>{row.competitorExperience}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white border-l border-slate-800 bg-indigo-950/20">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span>{row.challengerExperience}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Zero-Friction Migration FAQ */}
      <section className="py-16 md:py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-3 py-1 mb-3">
              Zero-Friction Switch
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Switching Questions Answered
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Everything you need to know about leaving {data.competitorName} without friction or downtime.
            </p>
          </div>

          <div className="space-y-4">
            {data.migrationFaq.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-100 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Final High-Conversion CTA Banner (Headline Inline Editable) */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-700/50 p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-indigo-950/80">
            <div className="relative group/ctaedit">
              <h2
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={handleFinalCtaBlur}
                className={`text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight ${
                  isEditable
                    ? "outline-none border border-dashed border-indigo-400/40 hover:border-indigo-400 focus:border-indigo-400 focus:bg-indigo-950/30 rounded-xl px-2 py-1 transition-all cursor-text"
                    : ""
                }`}
              >
                {data.finalCta.headline}
              </h2>
              {isEditable && (
                <span className="pointer-events-none absolute -top-3 right-4 hidden group-hover/ctaedit:flex items-center gap-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  <Pencil className="h-2.5 w-2.5" /> Edit
                </span>
              )}
            </div>

            <p className="mt-4 text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto">
              {data.finalCta.subheadline}
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-extrabold text-indigo-950 shadow-xl transition-all hover:bg-indigo-50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span>{data.finalCta.buttonText}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-xs text-indigo-300/80">
              Risk-free 14-day transition period • No upfront commitment required
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              {data.challengerName} vs. {data.competitorName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-800">•</span>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-800">•</span>
            <span>
              Powered by{" "}
              <span className="font-semibold text-indigo-400">ChallengerPage</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
