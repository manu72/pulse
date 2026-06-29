# Pulse

Pulse is a premium, mobile-friendly executive dashboard for monitoring the health of Throwing Eights websites, apps and cloud services.

It is not a generic analytics clone. Pulse is designed to feel like a calm company command centre: fast, polished and useful at a glance.

The homepage should eventually answer one question:

> Good morning. How is the business doing right now?

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
