# ChallengerPage

Turn your competitor's 1-star reviews into high-converting landing pages.

ChallengerPage targets 1–3 star Google Maps reviews (via the Outscraper API), uses Google Gemini to extract authentic customer complaints, and synthesizes them into an objection-busting "Why switch from [Competitor] to Us" counter-landing page — complete with pain-point battlecards, a side-by-side comparison matrix, and a migration FAQ.

Built for the Product Hunt x Google Cloud Run Hackathon, prioritizing simplicity, rock-solid demo fallbacks (presets + manual review paste), and fast serverless execution on Google Cloud Run.

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS + `@tailwindcss/typography`, Lucide React icons
- **Review ingestion:** Outscraper Google Maps Reviews API (rating cutoff ≤ 3)
- **LLM:** Google Gemini via `@google/genai` (schema-enforced JSON output)
- **Persistence:** Upstash Redis (HTTP REST, no connection pooling)
- **Deployment:** Google Cloud Run (Docker multi-stage build, `output: 'standalone'`)

## Getting Started

### Prerequisites

- Node.js 20+
- API keys for Upstash Redis, Google Gemini, and Outscraper

### Setup

```bash
git clone https://github.com/taylorazulai/phunt-x-google.git
cd phunt-x-google
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your credentials:

```bash
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_rest_token"
GEMINI_API_KEY="your_gemini_api_key"
OUTSCRAPER_API_KEY="your_outscraper_api_key"
```

### Scripts

```bash
npm run dev    # start the dev server at http://localhost:3000
npm run build  # production build (standalone output in .next/standalone)
npm start      # serve the production build
npm run lint   # ESLint
```

## Project Structure

```
app/                  # App Router entry points (layout, page, globals.css)
components/
  CounterLandingPage.tsx  # generated counter-page template (hero, battlecards, matrix, FAQ, CTA)
  DynamicIcon.tsx         # safe dynamic Lucide icon resolver with fallback
lib/
  types.ts            # core data contracts (GenerationRequest, ChallengerPageData, ...)
  mock-data.ts        # 3 high-fidelity demo presets (Boutique Gym, SaaS CRM, Coworking)
main-docs/            # PRD, stage prompts, and project memory (see AGENTS.md)
```

## How It Works

1. **Ingest** — `POST /api/scrape` fetches a competitor's low-rating Google Maps reviews via Outscraper, with a manual text-paste fallback and 1-click demo presets so the demo never breaks.
2. **Generate** — `POST /api/generate` sends the reviews plus your product name and pitch to Gemini, which returns a validated `ChallengerPageData` structure (hero copy, battlecards quoting real reviews, comparison matrix, migration FAQ).
3. **Publish** — `POST /api/pages` stores the page in Upstash Redis under a `nanoid` key; `/p/[id]` renders it as a shareable, SEO-ready Server Component.

## Project Status

Built in stages per `main-docs/challenger-page-prd.md`:

- **Stage 1 — Foundation & scaffolding:** complete (clean standalone build, 0 TS errors, 0 lint warnings; full counter-landing page UI with preset switcher).
- **Stage 2 — Review ingestion (`/api/scrape`) & fallbacks:** next up.
- **Stages 3–5 — Gemini copy engine, KV persistence & sharing, Cloud Run deployment:** planned.

## Documentation

- `main-docs/challenger-page-prd.md` — technical source of truth (full spec)
- `AGENTS.md` — procedural rules for agents and engineers
- `main-docs/memory/running-doc.md` — current project state
