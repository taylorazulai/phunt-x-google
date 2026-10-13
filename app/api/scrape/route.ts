import { NextRequest, NextResponse } from "next/server";
import { ScrapeRequest, ScrapeResponse, CompetitorReview } from "@/lib/types";
import { fetchCompetitorReviews, sanitizeReviewText, OutscraperError } from "@/lib/outscraper";
import { MOCK_PRESETS, getPresetReviews } from "@/lib/mock-data";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body: ScrapeRequest = await req.json().catch(() => ({}));
    const { competitorQuery, presetId, manualReviews } = body;

    // 1. Preset Ingestion Mode (0ms latency demo path)
    if (presetId) {
      const preset = MOCK_PRESETS.find((p) => p.id === presetId) || MOCK_PRESETS[0];
      const reviews = getPresetReviews(preset.id);

      const response: ScrapeResponse = {
        success: true,
        reviews,
        source: "preset",
        competitorName: preset.data.competitorName,
      };
      return NextResponse.json(response);
    }

    // 2. Manual Reviews Ingestion Mode
    if (manualReviews && Array.isArray(manualReviews) && manualReviews.length > 0) {
      const parsedReviews: CompetitorReview[] = [];

      for (let i = 0; i < manualReviews.length; i++) {
        const raw = manualReviews[i];
        if (!raw || typeof raw !== "string") continue;

        // Extract rating if user prefixed it like "[1 star]" or "Rating: 2"
        let rating = 1;
        const ratingMatch = raw.match(/(?:rating:?\s*|[\[\(])?([1-3])(?:\s*(?:star|stars|\/5))?[\]\)]?/i);
        if (ratingMatch) {
          const parsedRating = parseInt(ratingMatch[1], 10);
          if (parsedRating >= 1 && parsedRating <= 3) {
            rating = parsedRating;
          }
        }

        const cleaned = sanitizeReviewText(raw, 600);
        if (cleaned.length < 10) continue;

        parsedReviews.push({
          id: `manual-${nanoid(8)}`,
          author: `Customer Reviewer #${i + 1}`,
          rating,
          text: cleaned,
          publishDate: new Date().toISOString(),
        });
      }

      if (parsedReviews.length > 0) {
        const response: ScrapeResponse = {
          success: true,
          reviews: parsedReviews,
          source: "manual",
          competitorName: competitorQuery?.trim() || "Competitor",
        };
        return NextResponse.json(response);
      }
    }

    // 3. Google Maps Outscraper Scrape Mode
    if (competitorQuery && competitorQuery.trim().length > 0) {
      const trimmedQuery = competitorQuery.trim();

      try {
        const scraped = await fetchCompetitorReviews(trimmedQuery, 20);
        const response: ScrapeResponse = {
          success: true,
          reviews: scraped.reviews,
          source: "outscraper",
          competitorName: scraped.competitorName,
        };
        return NextResponse.json(response);
      } catch (scrapeErr: unknown) {
        const errMsg = scrapeErr instanceof Error ? scrapeErr.message : "Outscraper API unavailable";
        const isMissingKey =
          scrapeErr instanceof OutscraperError && scrapeErr.code === "MISSING_API_KEY";

        // Intelligent preset matcher based on query keywords
        const lowerQ = trimmedQuery.toLowerCase();
        let fallbackPreset = MOCK_PRESETS[0]; // default to Gym
        if (lowerQ.includes("crm") || lowerQ.includes("sales") || lowerQ.includes("software") || lowerQ.includes("saas")) {
          fallbackPreset = MOCK_PRESETS[1];
        } else if (lowerQ.includes("work") || lowerQ.includes("space") || lowerQ.includes("office") || lowerQ.includes("suite")) {
          fallbackPreset = MOCK_PRESETS[2];
        }

        const fallbackReviews = getPresetReviews(fallbackPreset.id);

        const notice = isMissingKey
          ? "Outscraper API key is not configured in Cloud Run / environment. Loaded verified benchmark reviews for preview."
          : `Outscraper notice: ${errMsg}. Loaded verified benchmark reviews for preview.`;

        const response: ScrapeResponse = {
          success: true,
          reviews: fallbackReviews,
          source: "preset",
          competitorName: trimmedQuery.startsWith("http")
            ? fallbackPreset.data.competitorName
            : trimmedQuery,
          fallbackNotice: notice,
        };

        return NextResponse.json(response, { status: 200 });
      }
    }

    // Fallback if no valid parameters provided
    return NextResponse.json(
      {
        success: false,
        reviews: [],
        source: "preset",
        competitorName: "",
        fallbackNotice: "Please provide a competitor name, Google Maps link, manual reviews, or select a preset.",
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        reviews: [],
        source: "preset",
        competitorName: "",
        fallbackNotice: err instanceof Error ? err.message : "Internal ingestion server error",
      },
      { status: 500 }
    );
  }
}
