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

Initial scaffold + database foundation.

The dashboard runs on mock data by default. The Turso/libSQL storage layer is in place: when the database is configured, the `products` table is the source of truth for the product list, with an automatic mock fallback. Pulse still does not connect to GA4, Vercel, Cloud Run, Firebase, Supabase or any production analytics source yet.

## Tech Stack

- SvelteKit
- TypeScript
- Tailwind CSS
- Turso / libSQL (database foundation)
- Vercel hosting
- Supabase later
- Server-side aggregation later
- AI-generated daily summaries later

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

## Database (Turso / libSQL)

Pulse uses **Turso / libSQL** for its storage foundation. libSQL is the open-source SQLite fork Turso is built on, so the schema stays simple (text IDs, ISO date strings, JSON-in-TEXT columns) and runs identically on a local file or a managed Turso database. This stage adds the database layer only — there is no ORM, no auth, and no analytics ingestion yet.

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

### Seed products

```bash
npm run db:seed
```

This runs migrations (if needed), then upserts the current Pulse product list into the `products` table by slug, using `src/lib/mock/products.ts` as the source of truth. Safe to run repeatedly.

### What is still mocked

- Company metrics, daily briefing, recent activity and alerts still come from `src/lib/mock`.
- Metric snapshots, daily rollups, ingestion runs and AI summaries have tables and repository helpers but no data yet (no GA4 or AI wiring).
- If the database is empty or unavailable, products also fall back to mock data.

### What comes next

- Wire `products/[slug]` and the rest of the dashboard to the database.
- Add ingestion runs that write real metric snapshots (GA4, Vercel, etc.).
- Generate daily rollups and AI briefings into their tables.

## Project Structure

```text
src/
  lib/
    components/
      dashboard/     Dashboard-specific overview sections.
      product/       Pulse product shell and product detail UI.
      ui/            Small reusable UI primitives.
    config/          App metadata and navigation.
    mock/            Static product, metric, alert and activity data.
    server/
      ai/            Future server-only AI summary boundary.
      connectors/    Future external service connector contracts.
      db/            Turso/libSQL server-only client and repositories.
    styles/          Global Tailwind and design tokens.
    types/           Shared domain types.
  routes/
    +layout.svelte
    +page.svelte
    products/[slug]/+page.svelte
    settings/+page.svelte
migrations/          Numbered SQL migration files applied by scripts/migrate.ts.
scripts/             Standalone tsx scripts: migrate.ts and seed.ts.
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
- Connector files currently return placeholder health states and should not call real services until a later milestone.
- Styling uses semantic CSS color tokens in `src/lib/styles/app.css` with Tailwind utilities for layout.

## Design Direction

Pulse should feel closer to Linear, Vercel, Stripe or Supabase than Grafana or Google Analytics.

The interface should be spacious, mobile-first and executive-led:

- Show the briefing before the charts.
- Surface exceptions before raw data.
- Prefer readable summaries over dense analytics controls.
- Keep every screen polished enough to share in a client or leadership update.
