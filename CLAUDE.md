# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pulse is an executive command-centre dashboard for **Throwing Eights**' digital product health — built for founders, not analysts. Briefing-first, mobile-first: surface the 5-second summary before the charts, exceptions before raw data. Target aesthetic is Linear / Vercel / Stripe, not Grafana.

**Current milestone: scaffold + Turso/libSQL foundation + first real data loop.** The app still runs safely on mock data by default, but GA4 ingestion, stored metric snapshots, homepage metric overlays and OpenAI daily briefings are now wired when the required database/API credentials are configured. Vercel, Cloud Run, Firebase, Supabase, GitHub, Stripe and uptime connectors are still future work.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build (Vercel adapter)
npm run preview   # preview the production build
npm run check     # svelte-kit sync + svelte-check (this is the typecheck)
npm run lint      # prettier --check .  (no ESLint installed)
npm run format    # prettier --write .
npm run db:migrate # apply SQL migrations
npm run db:seed    # migrate, then seed products and GA4 metric sources
npm run ingest:ga4 # run GA4 ingestion locally
```

There is **no test framework** — do not invent `npm test`. `npm run lint` is Prettier formatting only, not a correctness linter. `npm run check` is the type-check gate.

## Stack

SvelteKit 2 (SSR + load), Svelte 5, TypeScript (strict, `checkJs`), Tailwind CSS **v4** (CSS-first, via `@tailwindcss/vite` — there is no `tailwind.config.js`), Vite and the Vercel adapter. Runtime integrations currently use `@libsql/client` for Turso/libSQL, `@google-analytics/data` for GA4 ingestion and `openai` for daily briefing generation. `tsx` runs local operational scripts. Supabase is still future work; `db/supabase.ts` currently throws if present.

## Architecture

### The deliberate mock -> server split

The most important thing to understand: **Pulse is hybrid now.** Mock data remains the graceful fallback and seed source, while selected server paths are real.

- Active real server modules:
  - `db/*.ts` — Turso/libSQL client and repositories for products, snapshots, rollups and AI summaries.
  - `connectors/ga4-data.ts` — GA4 ingestion core shared by the API route and local script.
  - `ai/briefing.ts` — OpenAI daily briefing generation from stored rollups.
  - `dashboard.ts` — overlays latest GA4 values onto homepage product cards.
- Transitional/future modules:
  - `connectors/google-analytics.ts`, `vercel.ts`, `cloud-run.ts`, `firebase.ts`, `uptime.ts` — placeholder health connector boundaries.
  - `aggregation.ts` — combines connector health but is not the active homepage data path.
  - `ai/daily-summary.ts` — legacy placeholder, superseded by `ai/briefing.ts`.
  - `db/supabase.ts` — future placeholder that throws "not configured".

Do not "fix" placeholder modules by wiring unrelated real calls unless that is the task. Preserve graceful fallback behavior: missing DB, GA4 or OpenAI config should not break the dashboard.

### Data flow and the intended migration path

Routes use SvelteKit `+page.server.ts` load functions as the swap point between mock fallback and real stored data. Keep components decoupled from the data source — they consume typed props, not mock modules directly.

- `/` overview: reads products from Turso when configured, falls back to `src/lib/mock/products.ts`, overlays latest GA4 metrics where snapshots exist, reads latest stored AI summary or shows empty/mock states, and still uses mock company metrics/activity/alerts.
- `/products/[slug]`: DB-first product row with mock fallback when the DB is not configured or errors. It does not yet overlay GA4 metrics on the detail page.
- `/settings`: placeholder/settings UI.
- `/api/ga4`: protected GA4 ingestion endpoint using `x-pulse-ingest-secret`.
- `/api/briefings/daily`: protected AI briefing generation endpoint using the same shared secret.

### Current runtime loop

1. `npm run db:seed` upserts mock products into `products` and creates active GA4 `metric_sources` with placeholder `ga4PropertyId` values.
2. Replace placeholder GA4 property IDs in `metric_sources.config`.
3. `npm run ingest:ga4` or `POST /api/ga4` pulls today/yesterday/last-7-days GA4 metrics.
4. Ingestion writes `metric_snapshots`, `daily_product_rollups` and `ingestion_runs`.
5. `POST /api/briefings/daily` generates a company briefing from stored rollups and saves it in `ai_summaries`.
6. The homepage displays stored products/briefing/metric overlays where available and mock or empty states elsewhere.

### Module layout (`src/lib`)

- `types/` — shared domain types (the contract between data source and UI).
- `mock/` — temporary fallback data and product seed source.
- `server/` — server-only DB, connector, AI and dashboard overlay code. Anything here must stay importable only by server load functions, API routes or scripts.
- `components/dashboard/` — overview sections (briefing, metrics, alerts, health grid, activity).
- `components/product/` — `AppShell`, `ProductSummary`.
- `components/ui/` — primitives (`Badge`, `MetricCard`, `Surface`).
- `config/app.ts` — `appConfig` (`name`, `owner`, navigation), declared `as const`.
- `styles/app.css` — design tokens.

## Conventions

- **Imports:** use the `$lib` alias (`$lib/...`), not relative paths across module boundaries. Route typings come from `./$types`.
- **Styling (Tailwind v4):** semantic color tokens are defined in `src/lib/styles/app.css` under `@theme inline` and exposed to utilities (e.g. `--color-surface`, `--color-positive/warning/critical`). **Use the tokens, not raw hex.** Theme is dark-only (`color-scheme: dark`). Use `Surface` for containers.
- **Prettier:** `singleQuote`, `trailingComma: none`, Svelte plugin. `npm run format` before committing.
- **Svelte 5** runes syntax is in use.
- **Env:** `.env.example` documents Turso/libSQL, protected ingestion secret, OpenAI, GA4 service-account credentials and future connector placeholders. Do not read local `.env`; ask for shape-only checks if needed.
