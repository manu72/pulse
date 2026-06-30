-- Per-source configuration stored as JSON.
-- Lets a product carry connector-specific identifiers (e.g. a GA4 property id,
-- primary domain, timezone, display order) without hard-coding them in routes.
-- A null config means "source registered, not yet configured".
ALTER TABLE metric_sources ADD COLUMN config TEXT;
