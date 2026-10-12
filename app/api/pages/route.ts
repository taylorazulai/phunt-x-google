import { NextRequest, NextResponse } from "next/server";
import { ChallengerPageData } from "@/lib/types";
import { savePage } from "@/lib/kv";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body: Partial<ChallengerPageData> = await req.json().catch(() => ({}));

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    // Ensure required fields exist
    const id = body.id && body.id.trim() ? body.id.trim() : nanoid(10);
    const pageData: ChallengerPageData = {
      id,
      createdAt: body.createdAt || Date.now(),
      competitorName: body.competitorName || "Competitor",
      challengerName: body.challengerName || "Challenger",
      hero: body.hero || {
        badge: "Alternative to Competitor",
        headline: "The Modern Alternative You Deserve",
        subheadline: "Transparent pricing and zero cancellation hassles.",
        ctaPrimary: "Start Free 14-Day Trial",
      },
      battlecards: Array.isArray(body.battlecards) ? body.battlecards : [],
      comparisonMatrix: Array.isArray(body.comparisonMatrix) ? body.comparisonMatrix : [],
      migrationFaq: Array.isArray(body.migrationFaq) ? body.migrationFaq : [],
      finalCta: body.finalCta || {
        headline: "Switch Today",
        subheadline: "Join customers making the switch with zero downtime.",
        buttonText: "Claim Your 14-Day Free Switcher Pass",
      },
    };

    await savePage(pageData);

    return NextResponse.json(
      {
        success: true,
        id: pageData.id,
        url: `/p/${pageData.id}`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error in /api/pages route:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to persist page",
      },
      { status: 500 }
    );
  }
}
