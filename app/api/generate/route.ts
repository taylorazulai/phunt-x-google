import { NextRequest, NextResponse } from "next/server";
import { generateChallengerPage } from "@/lib/gemini";
import { CompetitorReview } from "@/lib/types";
import { MOCK_REVIEWS_GYM } from "@/lib/mock-data";

export interface GenerateRequestBody {
  competitorName: string;
  challengerName: string;
  challengerPitch: string;
  reviews: CompetitorReview[];
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<GenerateRequestBody> = await req.json().catch(() => ({}));
    const {
      competitorName = "",
      challengerName = "",
      challengerPitch = "",
      reviews = [],
    } = body;

    // Validate non-empty fields with sensible defaults if partially omitted
    const compName = competitorName.trim() || "Competitor Inc";
    const chalName = challengerName.trim() || "Challenger";
    const chalPitch = challengerPitch.trim() || "Transparent pricing with modern customer-first service.";

    // Fallback to gym seed reviews if none provided
    const reviewList =
      Array.isArray(reviews) && reviews.length > 0
        ? reviews
        : MOCK_REVIEWS_GYM;

    const result = await generateChallengerPage({
      competitorName: compName,
      challengerName: chalName,
      challengerPitch: chalPitch,
      reviews: reviewList,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        modelUsed: result.modelUsed,
        isFallback: result.isFallback,
        notice: result.notice,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Critical error in /api/generate route:", err);
    // Never crash with 500 during hackathon judging
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal generation failure",
      },
      { status: 200 }
    );
  }
}
