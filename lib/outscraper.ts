import { CompetitorReview } from "./types";

export class OutscraperError extends Error {
  constructor(message: string, public readonly code: string = "OUTSCRAPER_ERROR") {
    super(message);
    this.name = "OutscraperError";
  }
}

/**
 * Sanitizes and truncates a customer review string to a maximum length.
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

interface OutscraperReviewItem {
  review_id?: string;
  reviews_id?: string;
  google_id?: string;
  author_title?: string;
  review_rating?: number;
  review_text?: string;
  review_datetime_utc?: string;
  review_timestamp?: number;
}

interface OutscraperPlaceItem {
  name?: string;
  rating?: number;
  reviews?: number;
  reviews_data?: OutscraperReviewItem[];
}

interface OutscraperResponse {
  id?: string;
  status?: string;
  data?: OutscraperPlaceItem[];
  error?: boolean;
  errorMessage?: string;
}

/**
 * Fetches negative 1-3 star competitor reviews from Google Maps via Outscraper.
 * Enforces sort: lowest_rating, ignoreEmpty: true, and async task polling.
 */
export async function fetchCompetitorReviews(
  query: string,
  limit: number = 20
): Promise<{ reviews: CompetitorReview[]; competitorName: string }> {
  const rawKey = process.env.OUTSCRAPER_API_KEY || process.env.OUTSCRAPER_KEY;
  const apiKey = rawKey ? rawKey.trim() : "";

  if (!apiKey || apiKey === "your_outscraper_api_key") {
    throw new OutscraperError(
      "OUTSCRAPER_API_KEY is not configured.",
      "MISSING_API_KEY"
    );
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new OutscraperError("Query cannot be empty.", "EMPTY_QUERY");
  }

  // Mandatory Outscraper parameters to get negative reviews with text:
  const params = new URLSearchParams({
    query: cleanQuery,
    reviewsLimit: String(Math.max(limit, 20)),
    sort: "lowest_rating", // MANDATORY: Forces 1-star reviews first
    cutoffRating: "3", // MANDATORY: Caps results at 3 stars maximum
    ignoreEmpty: "true", // MANDATORY: Excludes star-only reviews with no written text
    language: "en",
    async: "false", // Synchronous response if available
  });

  const endpoint = `https://api.app.outscraper.com/maps/reviews-v3?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      // 25-second timeout for live scraping
      signal: AbortSignal.timeout(25000),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new OutscraperError("Outscraper request timed out after 25s.", "TIMEOUT");
    }
    throw new OutscraperError(
      err instanceof Error ? err.message : "Network error contacting Outscraper",
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new OutscraperError(
      `Outscraper HTTP ${response.status}: ${errorText || response.statusText}`,
      `HTTP_${response.status}`
    );
  }

  const json: OutscraperResponse = await response.json();

  // If Outscraper queued the task asynchronously, poll results endpoint:
  if (json.status === "Pending" && json.id) {
    const polledData = await pollOutscraperTask(json.id, apiKey);
    return processOutscraperData(polledData, cleanQuery);
  }

  return processOutscraperData(json, cleanQuery);
}

async function pollOutscraperTask(
  requestId: string,
  apiKey: string
): Promise<OutscraperResponse> {
  const pollUrl = `https://api.app.outscraper.com/requests/${requestId}`;
  const startTime = Date.now();

  while (Date.now() - startTime < 25000) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const res = await fetch(pollUrl, {
        headers: { "X-API-KEY": apiKey },
      });
      if (res.ok) {
        const data: OutscraperResponse = await res.json();
        if (data.status === "Success") {
          return data;
        }
        if (data.status === "Failure") {
          throw new OutscraperError(
            data.errorMessage || "Outscraper scraping task failed.",
            "TASK_FAILED"
          );
        }
      }
    } catch (pollErr: unknown) {
      if (pollErr instanceof OutscraperError) throw pollErr;
      // Continue polling on transient network hiccup
    }
  }

  throw new OutscraperError(
    "Outscraper async polling timed out after 25s.",
    "POLL_TIMEOUT"
  );
}

function processOutscraperData(
  json: OutscraperResponse,
  fallbackQuery: string
): { reviews: CompetitorReview[]; competitorName: string } {
  if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
    throw new OutscraperError(
      "Outscraper returned empty data array for this query.",
      "EMPTY_DATA"
    );
  }

  const place = json.data[0];
  const competitorName =
    place.name ||
    fallbackQuery.replace(/^https?:\/\/[^\/]+\//, "").slice(0, 30);
  const rawReviews = place.reviews_data || [];

  if (rawReviews.length === 0) {
    throw new OutscraperError(
      "No reviews_data found inside place object.",
      "NO_REVIEWS_DATA"
    );
  }

  const normalizedReviews: CompetitorReview[] = rawReviews
    .map((r, index) => {
      const rating =
        typeof r.review_rating === "number" ? r.review_rating : 1;
      const text = sanitizeReviewText(r.review_text || "", 600);
      return {
        id: r.review_id || r.reviews_id || `rev-${index}-${Date.now()}`,
        author: r.author_title?.trim() || "Verified Customer",
        rating,
        text,
        publishDate: r.review_datetime_utc || undefined,
      };
    })
    // Filter to 1-3 stars with substantive text
    .filter((r) => r.rating <= 3 && r.text.length > 5);

  if (normalizedReviews.length === 0) {
    throw new OutscraperError(
      "Outscraper returned reviews, but none had rating <= 3 with written text.",
      "NO_NEGATIVE_REVIEWS"
    );
  }

  return {
    reviews: normalizedReviews.slice(0, 20),
    competitorName,
  };
}
