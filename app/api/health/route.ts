import { NextResponse } from "next/server";

export async function GET() {
  const mask = (val?: string) => {
    if (!val) return "NOT_SET";
    const clean = val.trim();
    if (clean === "" || clean.startsWith("your_") || clean.startsWith("https://your-")) {
      return "NOT_SET";
    }
    if (clean.length <= 8) {
      return `**** (${clean.length} chars)`;
    }
    return `${clean.slice(0, 4)}...${clean.slice(-4)} (${clean.length} chars)`;
  };

  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "challenger-page",
    secrets: {
      OUTSCRAPER_API_KEY: mask(
        process.env.OUTSCRAPER_API_KEY || process.env.OUTSCRAPER_KEY
      ),
      GEMINI_API_KEY: mask(
        process.env.GEMINI_API_KEY ||
          process.env.GEMINI_KEY ||
          process.env.GOOGLE_API_KEY
      ),
      UPSTASH_REDIS_REST_URL: mask(
        process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
      ),
      UPSTASH_REDIS_REST_TOKEN: mask(
        process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN
      ),
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash (default)",
    },
  });
}
