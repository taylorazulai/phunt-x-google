import { NextResponse } from "next/server";
import { fetchCompetitorReviews } from "@/lib/outscraper";
import { mockPresets } from "@/lib/mock-data";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { competitorQuery, presetId, manualReviews } = body;

    // 1. Preset Mode
    if (presetId) {
      const preset = mockPresets.find((p) => p.id === presetId) || mockPresets[0];
      return NextResponse.json({
        success: true,
        reviews: preset.reviews || [],
        competitorName: preset.competitorName || preset.data.competitorName,
        source: "preset",
      });
    }

    // 2. Manual Paste Mode
    if (manualReviews && Array.isArray(manualReviews) && manualReviews.length > 0) {
      const parsedReviews = manualReviews.map((text: string, idx: number) => ({
        id: `manual-${idx}-${Date.now()}`,
        author: `Customer Review ${idx + 1}`,
        rating: 1,
        text: text.slice(0, 600),
      }));
      return NextResponse.json({
        success: true,
        reviews: parsedReviews,
        competitorName: competitorQuery || "Competitor",
        source: "manual",
      });
    }

    // 3. Live Google Maps Scrape Mode
    if (competitorQuery && typeof competitorQuery === "string" && competitorQuery.trim()) {
      try {
        const { reviews, competitorName } = await fetchCompetitorReviews(competitorQuery, 20);
        return NextResponse.json({
          success: true,
          reviews,
          competitorName,
          source: "outscraper",
        });
      } catch (scrapeError: unknown) {
        const msg = scrapeError instanceof Error ? scrapeError.message : "Outscraper error";
        console.warn("Outscraper scrape warning:", msg);
        return NextResponse.json({
          success: false,
          reviews: mockPresets[0].reviews || [],
          competitorName: "Sample Competitor",
          source: "fallback",
          fallbackNotice: `Notice: ${msg}. Loaded sample reviews for preview.`,
        });
      }
    }

    return NextResponse.json(
      { error: "Missing competitorQuery, presetId, or manualReviews" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
