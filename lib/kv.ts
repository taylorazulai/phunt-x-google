import { Redis } from "@upstash/redis";
import { ChallengerPageData, LeadRecord } from "./types";
import { MOCK_PRESETS } from "./mock-data";

// In-memory zero-config fallback storage for local development & resilient demoing
declare global {
  var _pageCache: Map<string, ChallengerPageData> | undefined;
  var _leadCache: LeadRecord[] | undefined;
}

const pageCache = globalThis._pageCache ?? new Map<string, ChallengerPageData>();
if (!globalThis._pageCache) {
  globalThis._pageCache = pageCache;
}

const leadCache = globalThis._leadCache ?? [];
if (!globalThis._leadCache) {
  globalThis._leadCache = leadCache;
}

// 30 Days TTL in seconds
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

function isValidRedisUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    // Reject sample placeholder hostname from .env.example
    if (parsed.hostname === "your-database.upstash.io") return false;
    return parsed.hostname.endsWith(".upstash.io") || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

function getRedisClient(): Redis | null {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
  const url = rawUrl ? rawUrl.trim() : "";
  const token = rawToken ? rawToken.trim() : "";

  if (!isValidRedisUrl(url) || !token || token === "your_upstash_rest_token") {
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

/**
 * Persists a captured founder lead to Upstash Redis and in-memory cache.
 */
export async function saveLead(lead: LeadRecord): Promise<void> {
  // Always update in-memory cache
  leadCache.push(lead);

  const redis = getRedisClient();
  if (redis) {
    try {
      const emailKey = `lead:${lead.email.toLowerCase().trim()}`;
      await redis.set(emailKey, JSON.stringify(lead));
      await redis.lpush("leads:list", JSON.stringify(lead));
    } catch (err) {
      console.warn("Upstash saveLead failed, retained in memory cache:", err);
    }
  }
}

/**
 * Helper to retrieve stored leads from in-memory cache or Redis list.
 */
export async function getLeads(): Promise<LeadRecord[]> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const items = await redis.lrange("leads:list", 0, -1);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item) =>
          typeof item === "string" ? JSON.parse(item) : item
        );
      }
    } catch (err) {
      console.warn("Upstash getLeads failed, returning in-memory cache:", err);
    }
  }

  return leadCache;
}
