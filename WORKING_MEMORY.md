# Pulse Working Memory

- Current milestone: SvelteKit dashboard with Turso/libSQL storage foundation and first GA4 -> AI briefing loop.
- Default runtime remains mock-safe: missing DB, GA4, or OpenAI config should not break the dashboard.
- Active real data path: product config in `metric_sources`, GA4 ingestion to `metric_snapshots` and `daily_product_rollups`, AI summary saved to `ai_summaries`, and homepage/product routes reading DB-first where configured.
- Still mocked: company metrics top row, recent activity, alerts, and product conversion rate.
- Future connectors for Vercel, Cloud Run, Firebase, Supabase, GitHub, Stripe, and uptime are not wired yet.
