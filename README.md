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

Know exactly what’s happening.

## Principles

- Beautiful by default.
- Mobile first.
- Executive summaries before detailed reports.
- Data from many sources, presented as one.
- Fast enough to check dozens of times a day.
- AI should explain, not overwhelm.
- Design is a feature.

## Status

Initial scaffold only.

This milestone is a static/mock SvelteKit dashboard shell. It does not connect to GA4, Vercel, Cloud Run, Firebase, Supabase or any production analytics source yet.

## Tech Stack

- SvelteKit
- TypeScript
- Tailwind CSS
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
      db/            Future Supabase server client boundary.
    styles/          Global Tailwind and design tokens.
    types/           Shared domain types.
  routes/
    +layout.svelte
    +page.svelte
    products/[slug]/+page.svelte
    settings/+page.svelte
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

Each mock product includes name, slug, URL, status, visitor count, visitor trend, conversion rate, top channel, health summary, last deploy and service health rows.

## Architecture Notes

- Routes use SvelteKit SSR/load patterns so future server aggregation can replace mock data without changing page components heavily.
- Mock data lives in `src/lib/mock` and should be treated as a temporary local data source.
- External data boundaries live under `src/lib/server`, keeping future credentials and API calls server-only.
- Connector files currently return placeholder health states and should not call real services until a later milestone.
- Styling uses semantic CSS color tokens in `src/lib/styles/app.css` with Tailwind utilities for layout.

## Design Direction

Pulse should feel closer to Linear, Vercel, Stripe or Supabase than Grafana or Google Analytics.

The interface should be spacious, mobile-first and executive-led:

- Show the briefing before the charts.
- Surface exceptions before raw data.
- Prefer readable summaries over dense analytics controls.
- Keep every screen polished enough to share in a client or leadership update.
