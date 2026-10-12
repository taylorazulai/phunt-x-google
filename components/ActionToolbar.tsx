"use client";

import React, { useState } from "react";
import { ChallengerPageData } from "@/lib/types";
import {
  Share2,
  Code,
  FileText,
  Pencil,
  Copy,
  ExternalLink,
  Check,
  Loader2,
  X,
  Globe,
} from "lucide-react";

interface ActionToolbarProps {
  pageData: ChallengerPageData;
  isEditable: boolean;
  onToggleEditable: () => void;
  onPagePublished?: (url: string) => void;
}

export function ActionToolbar({
  pageData,
  isEditable,
  onToggleEditable,
  onPagePublished,
}: ActionToolbarProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Publish to Upstash Redis KV / API
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to publish page");
      }

      const fullUrl = `${window.location.origin}/p/${json.id}`;
      setPublishedUrl(fullUrl);
      if (onPagePublished) onPagePublished(fullUrl);
      showToast("Page published successfully!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Publishing failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  // 2. Copy Standalone Tailwind HTML to Clipboard
  const handleCopyTailwind = async () => {
    const htmlContent = generateStandaloneTailwindHtml(pageData);
    await navigator.clipboard.writeText(htmlContent);
    showToast("Standalone Tailwind HTML copied to clipboard!");
  };

  // 3. Copy Structured Markdown to Clipboard
  const handleCopyMarkdown = async () => {
    const markdownContent = generatePageMarkdown(pageData);
    await navigator.clipboard.writeText(markdownContent);
    showToast("Structured Markdown copied to clipboard!");
  };

  const copyModalLink = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="h-3.5 w-3.5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Toolbar Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/95 px-3 py-2 text-xs backdrop-blur-md shadow-lg">
        {/* Left: Mode Indicators */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEditable}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
              isEditable
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
            }`}
            title="Toggle inline editing on the preview canvas"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>{isEditable ? "Inline Editing: ON" : "Edit Copy"}</span>
          </button>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click elements to polish
          </span>
        </div>

        {/* Right: Export & Publish Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 font-semibold text-slate-300 hover:bg-slate-750 hover:text-white transition-colors"
            title="Export page copy as structured Markdown"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Markdown</span>
            <span className="sm:hidden">MD</span>
          </button>

          {/* Copy Tailwind HTML */}
          <button
            type="button"
            onClick={handleCopyTailwind}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 font-semibold text-slate-300 hover:bg-slate-750 hover:text-white transition-colors"
            title="Export standalone HTML with Tailwind CSS"
          >
            <Code className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Tailwind HTML</span>
            <span className="sm:hidden">HTML</span>
          </button>

          {/* Publish & Share Link */}
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-3.5 py-1.5 font-bold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-amber-300" />
                <span>Publish & Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Published URL Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Counter-Page Published!
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live shareable comparison link active for 30 days
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPublishedUrl(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Shareable Public URL
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="w-full bg-transparent text-xs text-indigo-300 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={copyModalLink}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPublishedUrl(null)}
                  className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Formats a ChallengerPageData object into a self-contained HTML document with Tailwind CDN.
 */
export function generateStandaloneTailwindHtml(page: ChallengerPageData): string {
  const battlecardHtml = page.battlecards
    .map(
      (b, i) => `
      <div class="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400">Issue #${i + 1}</span>
          <span class="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">${escapeHtml(b.painPointCategory)}</span>
        </div>
        <div class="mt-5 rounded-xl border border-rose-950 bg-rose-950/20 p-4">
          <span class="text-xs font-bold text-rose-300 uppercase tracking-wide block mb-1">1★ ${escapeHtml(page.competitorName)} Complaint</span>
          <p class="text-xs text-slate-300 italic">${escapeHtml(b.competitorQuote)}</p>
        </div>
        <div class="mt-5 flex-1 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide block mb-1">✓ How ${escapeHtml(page.challengerName)} Solves This</span>
          <p class="text-xs text-slate-200">${escapeHtml(b.counterPitch)}</p>
        </div>
      </div>`
    )
    .join("\n");

  const matrixHtml = page.comparisonMatrix
    .map(
      (m) => `
      <tr class="border-b border-slate-800/60">
        <td class="py-4 px-6 text-slate-200 font-medium">${escapeHtml(m.featureOrCapability)}</td>
        <td class="py-4 px-6 text-slate-300 border-l border-slate-800 bg-rose-950/5">✕ ${escapeHtml(m.competitorExperience)}</td>
        <td class="py-4 px-6 text-white font-semibold border-l border-slate-800 bg-indigo-950/20">✓ ${escapeHtml(m.challengerExperience)}</td>
      </tr>`
    )
    .join("\n");

  const faqHtml = page.migrationFaq
    .map(
      (f) => `
      <div class="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
        <h3 class="text-sm sm:text-base font-semibold text-slate-100">${escapeHtml(f.question)}</h3>
        <p class="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">${escapeHtml(f.answer)}</p>
      </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Why Switch from ${escapeHtml(page.competitorName)} to ${escapeHtml(page.challengerName)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
  <!-- Announcement Banner -->
  <div class="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-2.5 text-center text-xs md:text-sm font-semibold text-white shadow-md">
    Switching from <span class="font-bold underline">${escapeHtml(page.competitorName)}</span>? Claim our 14-day risk-free migration offer today.
  </div>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 text-center max-w-5xl mx-auto px-4">
    <div class="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-indigo-300 mb-6">
      ${escapeHtml(page.hero.badge)}
    </div>
    <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
      ${escapeHtml(page.hero.headline)}
    </h1>
    <p class="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
      ${escapeHtml(page.hero.subheadline)}
    </p>
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#cta" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-4 text-base font-bold text-white shadow-lg hover:bg-indigo-500">
        ${escapeHtml(page.hero.ctaPrimary)}
      </a>
      ${
        page.hero.ctaSecondary
          ? `<a href="#matrix" class="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-base font-semibold text-slate-200 hover:bg-slate-800">
        ${escapeHtml(page.hero.ctaSecondary)}
      </a>`
          : ""
      }
    </div>
  </section>

  <!-- Pain Points Battlecards -->
  <section class="py-16 md:py-24 bg-slate-900/60 border-y border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14">
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Why Customers Are Leaving ${escapeHtml(page.competitorName)}</h2>
        <p class="mt-3 text-slate-400 text-sm sm:text-base">Real complaints compared side-by-side with ${escapeHtml(page.challengerName)}'s modern standard.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        ${battlecardHtml}
      </div>
    </div>
  </section>

  <!-- Comparison Matrix -->
  <section id="matrix" class="py-16 md:py-24 max-w-5xl mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Head-to-Head Comparison</h2>
    </div>
    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
      <table class="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr class="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-xs">
            <th class="py-4 px-6">Feature / Metric</th>
            <th class="py-4 px-6 border-l border-slate-800 text-rose-400">${escapeHtml(page.competitorName)}</th>
            <th class="py-4 px-6 border-l border-slate-800 text-indigo-300 font-bold">${escapeHtml(page.challengerName)}</th>
          </tr>
        </thead>
        <tbody>
          ${matrixHtml}
        </tbody>
      </table>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-16 md:py-24 bg-slate-900/40 border-t border-slate-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Switching Questions Answered</h2>
      </div>
      <div class="space-y-4">
        ${faqHtml}
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section id="cta" class="py-16 md:py-24 max-w-5xl mx-auto px-4 text-center">
    <div class="rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-950 border border-indigo-700/50 p-8 sm:p-14 shadow-2xl">
      <h2 class="text-2xl sm:text-4xl font-extrabold text-white">${escapeHtml(page.finalCta.headline)}</h2>
      <p class="mt-4 text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto">${escapeHtml(page.finalCta.subheadline)}</p>
      <div class="mt-8">
        <button class="rounded-xl bg-white px-8 py-4 text-base font-extrabold text-indigo-950 shadow-xl hover:bg-indigo-50">
          ${escapeHtml(page.finalCta.buttonText)}
        </button>
      </div>
    </div>
  </section>

  <footer class="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
    Powered by ChallengerPage
  </footer>
</body>
</html>`;
}

/**
 * Formats ChallengerPageData into structured Markdown.
 */
export function generatePageMarkdown(page: ChallengerPageData): string {
  const battlecardsMd = page.battlecards
    .map(
      (b, i) => `### Issue ${i + 1}: ${b.painPointCategory}
- **Competitor Complaint (1★):** ${b.competitorQuote}
- **How ${page.challengerName} Solves This:** ${b.counterPitch}`
    )
    .join("\n\n");

  const matrixMd = page.comparisonMatrix
    .map(
      (m) =>
        `| ${m.featureOrCapability} | ❌ ${m.competitorExperience} | ✅ ${m.challengerExperience} |`
    )
    .join("\n");

  const faqMd = page.migrationFaq
    .map((f) => `#### Q: ${f.question}\n${f.answer}`)
    .join("\n\n");

  return `# Why Switch from ${page.competitorName} to ${page.challengerName}

> **Announcement:** Switching from ${page.competitorName}? Claim our 14-day risk-free migration offer today.

---

## ${page.hero.headline}
*${page.hero.badge}*

${page.hero.subheadline}

**Primary CTA:** [${page.hero.ctaPrimary}]  
${page.hero.ctaSecondary ? `**Secondary CTA:** [${page.hero.ctaSecondary}]` : ""}

---

## Customer Pain Points & Objection-Handling Battlecards

${battlecardsMd}

---

## Head-to-Head Comparison Matrix

| Feature / Standard | ${page.competitorName} | ${page.challengerName} |
| :--- | :--- | :--- |
${matrixMd}

---

## Migration & Switching FAQ

${faqMd}

---

## ${page.finalCta.headline}
${page.finalCta.subheadline}

👉 **[${page.finalCta.buttonText}]**

*Powered by ChallengerPage*
`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
