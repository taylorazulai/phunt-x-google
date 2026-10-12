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

export interface PageTheme {
  industry: "fitness" | "legal" | "saas" | "coworking" | "healthcare" | "general";
  palette: {
    heroBg: string;
    accentBadge: string;
    primaryCta: string;
    cardBg: string;
    quoteBorder: string;
    matrixWinner: string;
  };
  fontVibe: "modern-sans" | "editorial-serif" | "bold-grotesque";
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
  theme?: PageTheme;
}

export interface ScrapeRequest {
  competitorQuery?: string;
  presetId?: string;
  manualReviews?: string[];
}

export interface ScrapeResponse {
  success: boolean;
  reviews: CompetitorReview[];
  source: "outscraper" | "preset" | "manual";
  competitorName: string;
  fallbackNotice?: string;
}

export interface MockPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  data: ChallengerPageData;
  reviews?: CompetitorReview[];
}

export interface LeadRecord {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Combined full name convenience field
  email: string;
  pageId?: string;
  sourceAction: "share_link" | "copy_html" | "copy_markdown" | "email_share";
  createdAt: number;
}
