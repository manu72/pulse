# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pulse is an executive command-centre dashboard for **Throwing Eights**' digital product health — built for founders, not analysts. Briefing-first, mobile-first: surface the 5-second summary before the charts, exceptions before raw data. Target aesthetic is Linear / Vercel / Stripe, not Grafana.

**Current milestone: scaffold only.** The app runs entirely on mock data. Nothing connects to GA4, Vercel, Cloud Run, Firebase, Supabase, or any real source yet.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build (Vercel adapter)
npm run preview   # preview the production build
npm run check     # svelte-kit sync + svelte-check (this is the typecheck)
npm run lint      # prettier --check .  (no ESLint installed)
npm run format    # prettier --write .
```

There is **no test framework** — do not invent `npm test`. `npm run lint` is Prettier formatting only, not a correctness linter. `npm run check` is the type-check gate.

## Stack

SvelteKit 2 (SSR + load), TypeScript (strict, `checkJs`), Tailwind CSS **v4** (CSS-first, via `@tailwindcss/vite` — there is no `tailwind.config.js`), Vite. Vercel adapter for hosting. `@libsql/client` is installed for a future Turso/libsql path; Supabase is the planned DB but `db/supabase.ts` currently throws.

## Architecture

### The deliberate mock → server split

The most important thing to understand: **`src/lib/server/**` is intentional future-boundary scaffolding, not broken code.** Every file there is a placeholder for a later milestone:

- `connectors/*.ts` (GA4, Vercel, Cloud Run, Firebase, Uptime) each return a hardcoded `warning` health state — `ProductConnector`/`ConnectorHealth` types in `connectors/types.ts`.
- `aggregation.ts` combines connector output (real logic, placeholder inputs).
- `ai/daily-summary.ts` returns a placeholder briefing.
- `db/supabase.ts` throws "not configured".

Do not "fix" these by wiring real calls unless that is the task. The UI is actually driven by **`src/lib/mock/{overview,products}.ts`**, which is a temporary local data source.

### Data flow and the intended migration path

Routes use SvelteKit `+page.server.ts` load functions (`routes/+page.server.ts`, `routes/products/[slug]/+page.server.ts`) that currently import mock data and return it. **This load boundary is the swap point**: replacing mock imports with real server aggregation should not require changing page components. Keep components decoupled from the data source — they consume typed props, not mock modules directly.

Routes: `/` (overview), `/products/[slug]` (detail, uses `getProductBySlug`, 404s via `@sveltejs/kit` `error()`), `/settings`.

### Module layout (`src/lib`)

- `types/` — shared domain types (the contract between data source and UI).
- `mock/` — temporary mock data (current source of truth for the UI).
- `server/` — server-only future boundaries (see above). Anything here must stay importable only by server load functions.
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
- **Env:** `.env.example` currently holds only Supabase placeholder vars; add real values there then copy to `.env` for local dev.
