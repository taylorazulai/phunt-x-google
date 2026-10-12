/**
 * Core TypeScript contracts for ChallengerPage.
 * Defined per PRD Section 3 and Stage 1 prompt specifications.
 */

export interface GenerationRequest {
  competitorQuery: string;       // Google Maps URL or place search query
  challengerName: string;        // e.g. "PulseFit", "EchoDesk"
  challengerPitch: string;       // e.g. "Transparent monthly billing with 24/7 human coaches"
  manualReviews?: string[];      // Optional fallback if user pastes raw reviews
  presetId?: string;             // Optional for 1-click demos
}

export interface CompetitorReview {
  id: string;
  author: string;
  rating: number;                // 1, 2, or 3
  text: string;
  publishDate?: string;
}

export interface BattlecardItem {
  id: string;
  painPointCategory: string;     // e.g. "Billing Surprise", "Poor Support"
  competitorQuote: string;       // Verbatim excerpt from a 1-3 star review
  counterPitch: string;          // How Challenger solves this definitively
  iconName: string;              // Lucide icon identifier (e.g. "DollarSign", "Clock", "Wifi")
}

export interface ComparisonMatrixItem {
  featureOrCapability: string;
  competitorExperience: string;
  challengerExperience: string;
  winner: "challenger" | "neutral";
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ChallengerPageHero {
  badge: string;                 // e.g. "Looking for an alternative to [Competitor]?"
  headline: string;              // Strong counter-hook
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}

export interface ChallengerPageFinalCta {
  headline: string;
  subheadline: string;
  buttonText: string;
}

export interface ChallengerPageData {
  id: string;                    // nanoid / unique slug
  createdAt: number;             // Timestamp in ms
  competitorName: string;
  challengerName: string;
  hero: ChallengerPageHero;
  battlecards: BattlecardItem[];
  comparisonMatrix: ComparisonMatrixItem[];
  migrationFaq: FaqItem[];
  finalCta: ChallengerPageFinalCta;
}

export interface MockPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  data: ChallengerPageData;
}
