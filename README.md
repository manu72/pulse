# Pulse

Executive dashboard for monitoring the health of digital products. Your company's digital pulse at a glance.

Pulse is a premium, mobile-friendly executive dashboard for monitoring the health of Throwing Eights websites, apps and cloud services.

It is not a generic analytics clone. Pulse is designed to feel like a calm company command centre: fast, polished and useful at a glance. An elegant dashboard that works as well on a phone as it does on a desktop.

Google Analytics, Vercel, Cloud Run, Firebase, Supabase, GitHub, Stripe and other services all become inputs into a single executive view designed to answer one simple question:

How is the business doing right now?

## Vision

Most dashboards are built for analysts.

Pulse is built for founders.

The goal is not to expose every metric available, but to surface the handful of insights that actually matter.

Open the dashboard.

Look for five seconds.

Know exactly what's happening.

## Principles

- Beautiful by default.
- Mobile first.
- Executive summaries before detailed reports.
- Data from many sources, presented as one.
- Fast enough to check dozens of times a day.
- AI should explain, not overwhelm.
- Design is a feature.

## Status

Scaffold + database foundation + first real data loop (GA4 -> snapshots -> AI briefing).

The dashboard runs on mock data by default. The Turso/libSQL storage layer is in place and the first end-to-end loop is wired: GA4 ingestion writes metric snapshots and daily rollups, the overview product cards overlay the latest GA4 numbers, and a generated AI daily briefing is stored and shown. Vercel, Cloud Run, Firebase, Supabase and GitHub are not connected yet, and everything degrades gracefully to mock data when GA4/AI/database are not configured.

## Tech Stack

- SvelteKit 2 with SSR/load functions and API routes.
- Svelte 5 and TypeScript.
- Tailwind CSS v4 via `@tailwindcss/vite`, with semantic tokens in `src/lib/styles/app.css`.
- Turso / libSQL via `@libsql/client`.
- Google Analytics Data API via `@google-analytics/data`.
- OpenAI daily briefing generation via `openai`.
- Vercel adapter for hosting.
- `tsx` for local operational scripts.
- Prettier and `svelte-check` for formatting/type checks.

## Architecture Overview

Pulse is deliberately split into three layers:

- UI components consume typed data and do not know whether values came from mock data or storage.
- SvelteKit server load functions are the swap point between fallback mock data and real stored data.
- Server-only modules under `src/lib/server` own credentials, DB access, connectors and AI generation.

Current runtime flow:

1. Seed products from `src/lib/mock/products.ts` into the `products` table.
2. Store per-product GA4 source config in `metric_sources.config`.
3. Run GA4 ingestion through `npm run ingest:ga4` or `POST /api/ga4`.
4. Write `metric_snapshots`, `daily_product_rollups` and `ingestion_runs`.
5. Overlay latest stored GA4 metrics onto homepage product cards.
6. Generate the daily briefing through `POST /api/briefings/daily`.
7. Store and display the latest company briefing from `ai_summaries`.

If any optional system is missing or fails, Pulse falls back to mock data or a neutral empty state instead of breaking the dashboard.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Run project checks:

```bash
npm run check
npm run lint
```

Build for production:

```bash
npm run build
```

## Development Workflow

Common commands:

```bash
npm run dev        # local SvelteKit dev server
npm run check      # svelte-kit sync + svelte-check
npm run lint       # Prettier check
npm run format     # Prettier write
npm run build      # production build
```

There is no dedicated test framework yet. Treat `npm run check` as the type/correctness gate and `npm run lint` as the formatting gate.

Operational scripts:

```bash
npm run db:migrate # apply SQL migrations
npm run db:seed    # migrate, then seed products and GA4 sources
npm run ingest:ga4 # run GA4 ingestion locally
```

## Database (Turso / libSQL)

Pulse uses **Turso / libSQL** for its storage foundation. libSQL is the open-source SQLite fork Turso is built on, so the schema stays simple (text IDs, ISO date strings, JSON-in-TEXT columns) and runs identically on a local file or a managed Turso database. There is no ORM and no auth layer yet. Database access is server-only and currently stores products, metric sources, GA4 snapshots, daily rollups, ingestion runs, AI summaries, alerts and preferences.

### Why Turso / libSQL

- SQLite-familiar SQL: boring and easy for future contributors and AI assistants to extend.
- One client (`@libsql/client`) works for local file development and remote Turso.
- Edge-friendly and server-side only — credentials never reach the browser.

### Required environment variables

Copy `.env.example` to `.env` and set:

```bash
# Local file database (no token needed):
TURSO_DATABASE_URL=file:./local.db

# Remote Turso:
TURSO_DATABASE_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

If both are unset, the app continues to run on mock data and will not crash.

### Run migrations

```bash
npm run db:migrate
```

This applies every `migrations/*.sql` file in order and records each in a `_migrations` table, so it is safe to run repeatedly.

### Seed products and GA4 sources

```bash
npm run db:seed
```

This runs migrations (if needed), then upserts the current Pulse product list into the `products` table by slug, using `src/lib/mock/products.ts` as the source of truth. It also creates an active `GA4` `metric_sources` row per product with a placeholder `ga4PropertyId` when no config exists yet — **replace these placeholders with real GA4 property IDs before running ingestion** (see [GA4 Ingestion](#ga4-ingestion-google-analytics)). Safe to run repeatedly; existing `metric_sources.config` JSON is preserved.

## GA4 Ingestion (Google Analytics)

GA4 metrics are pulled server-side with the official Google Analytics Data API (`@google-analytics/data`) and stored as `metric_snapshots` (today / yesterday / last 7 days) plus a `daily_product_rollups` summary row per product. Each run is recorded in `ingestion_runs`.

### 1. Configure GA4 property IDs

Property IDs are stored per product in the `metric_sources` table (config JSON), not in env. After seeding, set each product's real numeric GA4 property ID:

```sql
UPDATE metric_sources
SET config = json_set(config, '$.ga4PropertyId', '123456789')
WHERE product_id = (SELECT id FROM products WHERE slug = 'little-invites');
```

Re-running `npm run db:seed` preserves existing config JSON, so use an `UPDATE` like the one above to change GA4 property IDs for existing products.

### 2. Configure service-account credentials

Create a Google Cloud service account with the **Google Analytics Data API** enabled, grant it Viewer on each GA4 property, then set one of these in `.env`:

- `GOOGLE_APPLICATION_CREDENTIALS` = path to the service-account JSON key file, or
- `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY` (inline; best for serverless like Vercel).

### 3. Run ingestion locally

```bash
npm run ingest:ga4
```

Or call the protected endpoint (requires `PULSE_INGEST_SECRET`):

```bash
curl -X POST -H "x-pulse-ingest-secret: $PULSE_INGEST_SECRET" http://localhost:5173/api/ga4
```

One broken property is caught and recorded per product; it never fails the whole run.

## AI Daily Briefing

The company daily briefing is generated from stored daily rollups with OpenAI and saved to `ai_summaries` (one company briefing per day; regenerating replaces it). The model is grounded: it is told to summarise **only** the provided metrics and never invent numbers.

### Generate the briefing

```bash
curl -X POST -H "x-pulse-ingest-secret: $PULSE_INGEST_SECRET" http://localhost:5173/api/briefings/daily
```

Requires `OPENAI_API_KEY` (and `AI_MODEL`, default `gpt-4o-mini`). Returns `status: "skipped"` if no snapshots exist for today yet — run GA4 ingestion first.

The homepage Daily AI Briefing panel reads the latest stored summary. Until one exists it shows an empty state ("Pulse is ready to generate the first briefing once analytics snapshots are available.").

### What is real vs mocked now

- **Real (when configured):** product list, the `/products/[slug]` detail page, GA4 metric snapshots, daily rollups, ingestion run records, and the AI daily briefing.
- **Still mocked:** company metrics (top row), recent activity feed, and alerts. The product cards' conversion rate is also still mock (GA4 provides no conversion metric in this first set).
- **Graceful fallback:** if the database, GA4, or AI are not configured — or any call fails — Pulse falls back to mock values and never breaks. The homepage briefing shows a calm empty state until the first summary is generated.

### What comes next

- Bring the remaining overview sections (company metrics, activity, alerts) onto stored data.
- Add more connectors (Vercel, Cloud Run, Firebase, uptime) writing their own snapshots.
- Schedule ingestion and briefing via Vercel Cron.
- Product-scope briefings and trend charts.

## Deployment

Pulse builds with the SvelteKit Vercel adapter:

```bash
npm run build
```

For a deployed environment, configure the same optional environment variables from `.env.example`. The protected ingestion and briefing endpoints are designed to be called by a scheduler such as Vercel Cron, but no cron config is committed yet.

## Known Limitations

- No auth or multi-user access control is implemented yet.
- No dedicated test framework is installed yet.
- Vercel, Cloud Run, Firebase, Supabase, GitHub, Stripe and uptime connectors are not real integrations yet.
- Company metrics, recent activity and alerts still use mock data.
- Product conversion rate remains mock data because this first GA4 pass does not ingest a conversion metric.
- Scheduling is manual for now: run scripts locally or call the protected endpoints yourself.

## Project Structure

```text
.
├── migrations/       Numbered SQL migration files applied by scripts/migrate.ts.
├── scripts/          Standalone tsx scripts for env, DB, migrate, seed and GA4 ingest.
├── src/
│   ├── app.html
│   ├── lib/
│   │   ├── components/
│   │   │   ├── dashboard/  Dashboard-specific overview sections.
│   │   │   ├── product/    Pulse shell and product detail UI.
│   │   │   └── ui/         Small reusable UI primitives.
│   │   ├── config/         App metadata and navigation.
│   │   ├── mock/           Static fallback data and product seed source.
│   │   ├── server/
│   │   │   ├── ai/         AI daily briefing generator.
│   │   │   ├── connectors/ GA4 ingestion core + future connector contracts.
│   │   │   ├── db/         Turso/libSQL client and repositories.
│   │   │   └── dashboard.ts
│   │   ├── styles/         Global Tailwind and design tokens.
│   │   └── types/          Shared domain types.
│   └── routes/
│       ├── api/ga4/+server.ts
│       ├── api/briefings/daily/+server.ts
│       ├── products/[slug]/
│       └── settings/
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

## Mock Products

The scaffold includes placeholders for:

- Little Invites
- Bible Buddy
- onesnap
- SimTalk
- Throwing Eights
- Rateio
- SolarSim
- Lumo

Each mock product includes name, slug, URL, status, visitor count, visitor trend, conversion rate, top channel, health summary, last deploy and service health rows. These are also the seed values written to the `products` table.

## Architecture Notes

- Routes use SvelteKit SSR/load patterns so future server aggregation can replace mock data without changing page components heavily.
- Mock data lives in `src/lib/mock` and should be treated as a temporary local data source.
- External data boundaries live under `src/lib/server`, keeping future credentials and API calls server-only.
- Database access is server-only under `src/lib/server/db`; if `TURSO_DATABASE_URL` is unset the app falls back to mock data.
- GA4 ingestion (`src/lib/server/connectors/ga4-data.ts`) is self-contained: it takes an injected db client and credentials so it runs from both the API route and a standalone script. The placeholder connector files still return health states for the other services.
- Styling uses semantic CSS color tokens in `src/lib/styles/app.css` with Tailwind utilities for layout.

## Design Direction

Pulse should feel closer to Linear, Vercel, Stripe or Supabase than Grafana or Google Analytics.

The interface should be spacious, mobile-first and executive-led:

- Show the briefing before the charts.
- Surface exceptions before raw data.
- Prefer readable summaries over dense analytics controls.
- Keep every screen polished enough to share in a client or leadership update.
