# Pulse Working Memory

- Current milestone: SvelteKit dashboard with Turso/libSQL storage foundation and first GA4 -> AI briefing loop.
- Default runtime remains mock-safe: missing DB, GA4, or OpenAI config should not break the dashboard.
- Active real data path: product config in `metric_sources`, GA4 ingestion to `metric_snapshots` and `daily_product_rollups`, AI summary saved to `ai_summaries`, and homepage/product routes reading DB-first where configured.
- Homepage daily briefing is only "live" when a company `ai_summaries` row exists for the current configured GA4 local `summary_date`; older rows must not be shown as the current daily briefing.
- GA4 date ranges, snapshot periods, rollup keys, dashboard overlays, and daily briefing lookup must use each product's `metric_sources.config.timezone` calendar day rather than UTC string slicing.
- Seed scripts must preserve existing runtime connector config such as `metric_sources.config`; repeat seeds are for catalog backfill, not resetting live GA4 property IDs.
- Still mocked: company metrics top row, recent activity, alerts, and product conversion rate.
- Future connectors for Vercel, Cloud Run, Firebase, Supabase, GitHub, Stripe, and uptime are not wired yet.
