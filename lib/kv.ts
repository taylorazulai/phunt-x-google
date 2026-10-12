import { Redis } from "@upstash/redis";
import { ChallengerPageData } from "./types";
import { MOCK_PRESETS } from "./mock-data";

// In-memory zero-config fallback storage for local development & resilient demoing
declare global {
  var _pageCache: Map<string, ChallengerPageData> | undefined;
}

const pageCache = globalThis._pageCache ?? new Map<string, ChallengerPageData>();
if (!globalThis._pageCache) {
  globalThis._pageCache = pageCache;
}

// 30 Days TTL in seconds
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (
    !url ||
    url.trim() === "" ||
    url.includes("your-database.upstash.io") ||
    !token ||
    token.trim() === "" ||
    token === "your_upstash_rest_token"
  ) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis client:", err);
    return null;
  }
}

/**
 * Saves a generated or edited ChallengerPageData to Upstash Redis KV.
 * Falls back transparently to in-memory cache if Redis credentials are not configured.
 */
export async function savePage(pageData: ChallengerPageData): Promise<string> {
  const { id } = pageData;
  if (!id) {
    throw new Error("Cannot save page without a valid id.");
  }

  // Always update in-memory cache
  pageCache.set(id, pageData);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`page:${id}`, JSON.stringify(pageData), {
        ex: THIRTY_DAYS_SECONDS,
      });
    } catch (err) {
      console.warn(`Upstash set failed for page:${id}, retained in memory cache:`, err);
    }
  }

  return id;
}

/**
 * Retrieves a ChallengerPageData by unique ID or slug.
 * Checks Redis first, then in-memory cache, then demo presets. Returns null if not found.
 */
export async function getPage(id: string): Promise<ChallengerPageData | null> {
  if (!id || typeof id !== "string") {
    return null;
  }

  const cleanId = id.trim();

  // 1. Try Upstash Redis KV
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get(`page:${cleanId}`);
      if (data) {
        if (typeof data === "string") {
          return JSON.parse(data) as ChallengerPageData;
        }
        return data as ChallengerPageData;
      }
    } catch (err) {
      console.warn(`Upstash get failed for page:${cleanId}:`, err);
    }
  }

  // 2. Try In-Memory Fallback Cache
  if (pageCache.has(cleanId)) {
    return pageCache.get(cleanId) ?? null;
  }

  // 3. Try matching demo preset IDs
  const matchedPreset = MOCK_PRESETS.find(
    (p) =>
      p.id === cleanId ||
      p.id.replace("preset-", "") === cleanId ||
      cleanId.includes(p.id)
  );

  if (matchedPreset) {
    return matchedPreset.data;
  }

  return null;
}
