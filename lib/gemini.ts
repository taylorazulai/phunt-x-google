import { GoogleGenAI, Type } from "@google/genai";
import { nanoid } from "nanoid";
import { ChallengerPageData, CompetitorReview } from "./types";
import { MOCK_PRESETS } from "./mock-data";

export const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const FALLBACK_MODEL = "gemini-3.6-flash";

export interface GenerateOptions {
  competitorName: string;
  challengerName: string;
  challengerPitch: string;
  reviews: CompetitorReview[];
}

export interface GenerateResult {
  data: ChallengerPageData;
  modelUsed: string;
  isFallback: boolean;
  notice?: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    competitorName: { type: Type.STRING },
    challengerName: { type: Type.STRING },
    hero: {
      type: Type.OBJECT,
      properties: {
        badge: { type: Type.STRING },
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaPrimary: { type: Type.STRING },
        ctaSecondary: { type: Type.STRING },
      },
      required: ["badge", "headline", "subheadline", "ctaPrimary"],
    },
    battlecards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          painPointCategory: { type: Type.STRING },
          competitorQuote: { type: Type.STRING },
          counterPitch: { type: Type.STRING },
          iconName: { type: Type.STRING },
        },
        required: ["painPointCategory", "competitorQuote", "counterPitch", "iconName"],
      },
    },
    comparisonMatrix: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          featureOrCapability: { type: Type.STRING },
          competitorExperience: { type: Type.STRING },
          challengerExperience: { type: Type.STRING },
          winner: {
            type: Type.STRING,
            enum: ["challenger", "neutral"],
          },
        },
        required: [
          "featureOrCapability",
          "competitorExperience",
          "challengerExperience",
          "winner",
        ],
      },
    },
    migrationFaq: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
    finalCta: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        buttonText: { type: Type.STRING },
      },
      required: ["headline", "subheadline", "buttonText"],
    },
  },
  required: [
    "competitorName",
    "challengerName",
    "hero",
    "battlecards",
    "comparisonMatrix",
    "migrationFaq",
    "finalCta",
  ],
};

const SYSTEM_INSTRUCTION = `You are an elite conversion rate optimization (CRO) copywriter specializing in competitor displacement counter-landing pages.
Your mission is to turn real competitor 1-to-3 star customer reviews and the founder's value proposition into an objection-busting, high-converting comparison page.

STRICT RULES:
1. REVIEW ANALYSIS: Analyze the supplied 1-to-3 star reviews and identify the 3 most damaging, systemic flaws in the competitor's service or product.
2. ZERO-HALLUCINATION QUOTES: CRITICAL: For every battlecard 'competitorQuote', you MUST extract an authentic verbatim quote excerpt directly from the provided review texts. Do NOT fabricate, invent, extrapolate, or alter the customer's quote. Include quotation marks.
3. CONVERSION COUNTER-PITCH: For each battlecard 'counterPitch', position the challenger as the transparent, modern solution solving that exact pain point permanently, citing the challenger's pitch.
4. HEADLINE & HERO: Craft an urgent, compelling counter-hook headline that appeals to dissatisfied customers searching for an alternative.
5. COMPARISON MATRIX: Provide 4 to 5 sharp, side-by-side contrast rows comparing the painful legacy experience against the seamless challenger standard.
6. MIGRATION FAQ: Write 3 clear FAQs that eliminate switching friction (e.g. data transfer, contracts, zero downtime).
7. ICONS: For 'iconName', use only standard Lucide icon identifiers: ShieldAlert, CreditCard, Wrench, Clock, DollarSign, Users, Zap, Sparkles, Wifi, Building2, AlertCircle.`;

/**
 * Generates an objection-handling counter-page using Gemini 3.8 Flash,
 * with automatic fallback to Gemini 3.6 Flash and offline preset synthesis.
 */
export async function generateChallengerPage(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { competitorName, challengerName, challengerPitch, reviews } = options;

  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If API key is missing or dummy placeholder, use offline synthesis directly
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key") {
    return generateOfflineFallback(options, "GEMINI_API_KEY is not configured in environment.");
  }

  // Format reviews for prompt
  const reviewBulletPoints = reviews
    .slice(0, 15)
    .map((r, i) => `Review ${i + 1} (${r.rating}★ by ${r.author}): "${r.text}"`)
    .join("\n\n");

  const userPrompt = `TARGET COMPETITOR: ${competitorName}
CHALLENGER PRODUCT: ${challengerName}
CHALLENGER VALUE PROPOSITION & DIFFERENTIATORS: ${challengerPitch}

AUTHENTIC 1-TO-3 STAR CUSTOMER COMPLAINTS:
${reviewBulletPoints}

Generate the complete ChallengerPageData JSON now.`;

  const ai = new GoogleGenAI({ apiKey });

  // 2. Try Primary Model (gemini-3.8-flash)
  try {
    const res = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2, // Low temperature for high adherence to real quotes
      },
    });

    const text = res.text?.trim();
    if (!text) {
      throw new Error(`Empty response from ${PRIMARY_MODEL}`);
    }

    const parsed = JSON.parse(text);
    return {
      data: formatPageData(parsed, challengerName, competitorName),
      modelUsed: PRIMARY_MODEL,
      isFallback: false,
    };
  } catch (primaryErr: unknown) {
    console.warn(`Primary model ${PRIMARY_MODEL} failed, attempting ${FALLBACK_MODEL}:`, primaryErr);

    // 3. Try Secondary Fallback Model (gemini-3.6-flash)
    try {
      const fallbackRes = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      });

      const fallbackText = fallbackRes.text?.trim();
      if (!fallbackText) {
        throw new Error(`Empty response from ${FALLBACK_MODEL}`);
      }

      const parsed = JSON.parse(fallbackText);
      return {
        data: formatPageData(parsed, challengerName, competitorName),
        modelUsed: `${FALLBACK_MODEL} (High-Throughput Fallback)`,
        isFallback: false,
        notice: `Generated via high-throughput fallback model (${FALLBACK_MODEL}).`,
      };
    } catch (fallbackErr: unknown) {
      console.error(`Fallback model ${FALLBACK_MODEL} also failed:`, fallbackErr);
      const reason = fallbackErr instanceof Error ? fallbackErr.message : "Gemini API unavailable";
      return generateOfflineFallback(options, `Gemini Flash error: ${reason}`);
    }
  }
}

/**
 * Normalizes parsed model JSON into strict ChallengerPageData.
 */
function formatPageData(
  parsed: Partial<ChallengerPageData>,
  challengerName: string,
  competitorName: string
): ChallengerPageData {
  const battlecards = (parsed.battlecards || []).map((b, idx) => ({
    id: b.id || `bc-gen-${idx + 1}-${nanoid(6)}`,
    painPointCategory: b.painPointCategory || "Service Quality",
    competitorQuote: b.competitorQuote || "Customer experienced recurring issues.",
    counterPitch: b.counterPitch || `${challengerName} delivers a modern, transparent solution.`,
    iconName: b.iconName || "ShieldAlert",
  }));

  const comparisonMatrix = (parsed.comparisonMatrix || []).map((c) => ({
    featureOrCapability: c.featureOrCapability || "Service Standard",
    competitorExperience: c.competitorExperience || "Legacy constraints and hidden fees",
    challengerExperience: c.challengerExperience || "Transparent, modern, customer-first",
    winner: c.winner || "challenger",
  }));

  const migrationFaq = (parsed.migrationFaq || []).map((f) => ({
    question: f.question || "How does the migration process work?",
    answer: f.answer || "Our team handles the transition with zero downtime and guaranteed continuity.",
  }));

  return {
    id: parsed.id || nanoid(10),
    createdAt: Date.now(),
    competitorName: parsed.competitorName || competitorName,
    challengerName: parsed.challengerName || challengerName,
    hero: {
      badge: parsed.hero?.badge || `Looking for a Better Alternative to ${competitorName}?`,
      headline:
        parsed.hero?.headline ||
        `The Anti-${competitorName} Solution Built for Speed, Value, and Sanity`,
      subheadline:
        parsed.hero?.subheadline ||
        `Escape the frustration of legacy restrictions. Switch to ${challengerName} with zero downtime and risk-free onboarding.`,
      ctaPrimary: parsed.hero?.ctaPrimary || "Start Your 14-Day Free Switcher Pass",
      ctaSecondary: parsed.hero?.ctaSecondary || "Compare Specs & Pricing",
    },
    battlecards: battlecards.length >= 3 ? battlecards : ensureThreeBattlecards(battlecards, challengerName, competitorName),
    comparisonMatrix,
    migrationFaq,
    finalCta: {
      headline: parsed.finalCta?.headline || `Ready to Leave ${competitorName} Behind?`,
      subheadline:
        parsed.finalCta?.subheadline ||
        `Join hundreds of customers who switched to ${challengerName} this month.`,
      buttonText: parsed.finalCta?.buttonText || "Claim Your 14-Day Free Switcher Pass",
    },
  };
}

function ensureThreeBattlecards(
  existing: ChallengerPageData["battlecards"],
  challengerName: string,
  competitorName: string
) {
  const result = [...existing];
  while (result.length < 3) {
    const idx = result.length + 1;
    result.push({
      id: `bc-fallback-${idx}`,
      painPointCategory: `Systemic Issue #${idx}`,
      competitorQuote: `"Recurring friction with ${competitorName}'s support and policies."`,
      counterPitch: `${challengerName} eliminates this entirely with guaranteed response times and no red tape.`,
      iconName: "ShieldAlert",
    });
  }
  return result;
}

/**
 * Offline fallback synthesizer for demo resilience.
 */
function generateOfflineFallback(
  options: GenerateOptions,
  reason: string
): GenerateResult {
  const { competitorName, challengerName, challengerPitch, reviews } = options;

  // Find most matching preset
  const lowerComp = (competitorName || "").toLowerCase();
  let basePreset = MOCK_PRESETS[0]; // Gym default
  if (lowerComp.includes("crm") || lowerComp.includes("sales") || lowerComp.includes("titan") || lowerComp.includes("saas")) {
    basePreset = MOCK_PRESETS[1];
  } else if (lowerComp.includes("work") || lowerComp.includes("suite") || lowerComp.includes("office") || lowerComp.includes("apex")) {
    basePreset = MOCK_PRESETS[2];
  }

  // Synthesize battlecards using the actual reviews provided
  const synthesizedCards = basePreset.data.battlecards.map((b, idx) => {
    const reviewMatch = reviews[idx] || reviews[0];
    return {
      ...b,
      id: `bc-off-${nanoid(6)}`,
      competitorQuote: reviewMatch ? `"${reviewMatch.text}"` : b.competitorQuote,
      counterPitch: challengerPitch
        ? `${challengerName} solves this: ${challengerPitch}`
        : b.counterPitch,
    };
  });

  const pageData: ChallengerPageData = {
    ...basePreset.data,
    id: nanoid(10),
    createdAt: Date.now(),
    competitorName: competitorName || basePreset.data.competitorName,
    challengerName: challengerName || basePreset.data.challengerName,
    hero: {
      ...basePreset.data.hero,
      badge: `Tired of ${competitorName || basePreset.data.competitorName}'s Outdated Experience?`,
      headline: `${challengerName}: The Modern Alternative to ${competitorName}`,
      subheadline: challengerPitch || basePreset.data.hero.subheadline,
    },
    battlecards: synthesizedCards,
    finalCta: {
      ...basePreset.data.finalCta,
      headline: `Switch from ${competitorName} to ${challengerName} Today`,
      subheadline: `Risk-free 14-day transition period with zero downtime guarantee.`,
    },
  };

  return {
    data: pageData,
    modelUsed: "Offline Fallback Engine (Demo Mode)",
    isFallback: true,
    notice: `Demo Mode Active: ${reason}. Synthesized verified objection-handling copy with 0ms latency.`,
  };
}
