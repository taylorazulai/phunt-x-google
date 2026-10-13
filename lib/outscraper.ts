import { CompetitorReview } from "./types";
import { nanoid } from "nanoid";

export class OutscraperError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "OutscraperError";
  }
}

/**
 * Sanitizes and truncates a customer review string.
 * Strips excessive blank lines, trims whitespace, and limits to 600 characters.
 */
export function sanitizeReviewText(rawText: string, maxLength: number = 600): string {
  if (!rawText) return "";

  const cleaned = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
    .join("\n")
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength - 40) {
    return `${truncated.slice(0, lastSpace)}...`;
  }
  return `${truncated}...`;
}

interface OutscraperRawReview {
  review_id?: string;
  author_title?: string;
  review_rating?: number;
  review_text?: string;
  review_datetime_utc?: string;
  [key: string]: unknown;
}

interface OutscraperPlaceData {
  name?: string;
  query?: string;
  reviews_data?: OutscraperRawReview[];
  [key: string]: unknown;
}

interface OutscraperResponse {
  id?: string;
  status?: string;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * Calls Outscraper Google Maps Reviews API to fetch 1-3 star negative customer reviews.
 * Supports synchronous mode and transparent task polling for asynchronous task returns.
 */
export async function fetchCompetitorReviews(
  query: string,
  limit: number = 20
): Promise<{ competitorName: string; reviews: CompetitorReview[] }> {
  // Check primary and alias environment variables
  const rawKey = process.env.OUTSCRAPER_API_KEY || process.env.OUTSCRAPER_KEY;
  const apiKey = rawKey ? rawKey.trim() : "";

  if (!apiKey || apiKey === "your_outscraper_api_key") {
    throw new OutscraperError(
      "OUTSCRAPER_API_KEY is not configured in Cloud Run / environment.",
      "MISSING_API_KEY"
    );
  }

  const sanitizedQuery = query.trim();
  if (!sanitizedQuery) {
    throw new OutscraperError("Query cannot be empty.", "EMPTY_QUERY");
  }

  const endpoint = new URL("https://api.app.outscraper.com/maps/reviews-v3");
  endpoint.searchParams.set("query", sanitizedQuery);
  endpoint.searchParams.set("reviews_limit", String(Math.min(limit, 25)));
  endpoint.searchParams.set("reviewsLimit", String(Math.min(limit, 25)));
  endpoint.searchParams.set("cutoff_rating", "3");
  endpoint.searchParams.set("cutoffRating", "3");
  endpoint.searchParams.set("async", "false"); // Request synchronous response where possible
  endpoint.searchParams.set("language", "en");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s total timeout

  try {
    const res = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new OutscraperError(
        `Outscraper API responded with HTTP ${res.status}: ${errBody || res.statusText}`,
        `HTTP_${res.status}`
      );
    }

    let json: OutscraperResponse = await res.json();

    // Handling Asynchronous Outscraper Tasks:
    // If Outscraper returns status "Pending" or "In Progress", poll the request endpoint
    if (
      json &&
      json.id &&
      (json.status === "Pending" || json.status === "In Progress" || !json.data)
    ) {
      const pollStart = Date.now();
      const MAX_POLL_MS = 22000; // Poll for up to 22 seconds

      while (
        json.id &&
        (json.status === "Pending" || json.status === "In Progress" || !json.data) &&
        Date.now() - pollStart < MAX_POLL_MS
      ) {
        // Wait 2 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const pollRes = await fetch(
          `https://api.app.outscraper.com/requests/${json.id}`,
          {
            headers: {
              "X-API-KEY": apiKey,
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (pollRes.ok) {
          const pollJson = (await pollRes.json()) as OutscraperResponse;
          json = pollJson;
          if (json.status === "Success" || (Array.isArray(json.data) && json.data.length > 0)) {
            break;
          }
        }
      }
    }

    clearTimeout(timeoutId);

    // Extract raw review items and business name from response
    const rawItems: OutscraperRawReview[] = [];
    let detectedName = sanitizedQuery;

    if (json && Array.isArray(json.data)) {
      for (const entry of json.data) {
        if (Array.isArray(entry)) {
          for (const nested of entry) {
            if (nested && typeof nested === "object") {
              const place = nested as OutscraperPlaceData;
              if (place.name) detectedName = place.name;
              if (Array.isArray(place.reviews_data)) {
                rawItems.push(...place.reviews_data);
              }
            }
          }
        } else if (entry && typeof entry === "object") {
          const place = entry as OutscraperPlaceData;
          if (place.name) detectedName = place.name;
          if (Array.isArray(place.reviews_data)) {
            rawItems.push(...place.reviews_data);
          } else if (place.review_text) {
            rawItems.push(place as OutscraperRawReview);
          }
        }
      }
    }

    // Filter, sanitize, and normalize into CompetitorReview[]
    const normalizedReviews: CompetitorReview[] = [];

    for (const r of rawItems) {
      const rawText = r.review_text?.trim();
      if (!rawText) continue;

      const rating = Number(r.review_rating) || 1;
      if (rating > 3) continue; // Guarantee cutoff <= 3

      const sanitized = sanitizeReviewText(rawText, 600);
      if (sanitized.length < 10) continue;

      normalizedReviews.push({
        id: r.review_id || `outscraper-${nanoid(8)}`,
        author: r.author_title?.trim() || "Verified Google Reviewer",
        rating: Math.min(Math.max(rating, 1), 3),
        text: sanitized,
        publishDate: r.review_datetime_utc || new Date().toISOString(),
      });
    }

    if (normalizedReviews.length === 0) {
      throw new OutscraperError(
        `Outscraper processed "${sanitizedQuery}" but found zero 1-3 star customer reviews. The business may have exclusively 4-5 star reviews or no public reviews.`,
        "NO_REVIEWS_FOUND"
      );
    }

    return {
      competitorName: detectedName,
      reviews: normalizedReviews.slice(0, limit),
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof OutscraperError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new OutscraperError(
        "Outscraper API task timed out while waiting for Google Maps reviews to resolve.",
        "TIMEOUT"
      );
    }
    throw new OutscraperError(
      err instanceof Error ? err.message : "Failed to connect to Outscraper API",
      "NETWORK_ERROR"
    );
  }
}
