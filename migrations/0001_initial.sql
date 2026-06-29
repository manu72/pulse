-- Pulse initial schema.
-- SQLite/libSQL friendly: text IDs, ISO date/time strings, JSON stored as TEXT.
-- products.slug has a UNIQUE constraint, which already serves the products.slug lookup index.

-- products: one row per tracked product. Mirrors the Product domain type.
CREATE TABLE products (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  status          TEXT NOT NULL,            -- healthy | watch | attention
  visitors_today  INTEGER NOT NULL DEFAULT 0,
  visitors_trend  TEXT NOT NULL,            -- JSON { direction, percent }
  conversion_rate REAL NOT NULL DEFAULT 0,
  top_channel     TEXT NOT NULL,
  health_summary  TEXT NOT NULL,
  last_deploy     TEXT NOT NULL,
  services        TEXT NOT NULL,            -- JSON array of { name, provider, status }
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

-- metric_sources: a configured data source for a product (e.g. GA4, Vercel).
CREATE TABLE metric_sources (
  id           TEXT PRIMARY KEY,
  product_id   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source       TEXT NOT NULL,               -- GA4 | Vercel | Firebase | ...
  display_name TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL,
  UNIQUE(product_id, source)
);
CREATE INDEX idx_metric_sources_product ON metric_sources(product_id);

-- metric_snapshots: point-in-time metric values written by ingestion runs.
CREATE TABLE metric_snapshots (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_id     TEXT REFERENCES metric_sources(id) ON DELETE SET NULL,
  metric_key    TEXT NOT NULL,              -- sessions | deployments | uptime | ...
  metric_value  REAL NOT NULL,
  unit          TEXT,                       -- count | percent | ms | ...
  period_start  TEXT NOT NULL,
  period_end    TEXT NOT NULL,
  dimensions    TEXT,                       -- JSON breakdown (channel, country, ...)
  captured_at   TEXT NOT NULL
);
CREATE INDEX idx_snapshots_product      ON metric_snapshots(product_id);
CREATE INDEX idx_snapshots_source       ON metric_snapshots(source_id);
CREATE INDEX idx_snapshots_metric_key   ON metric_snapshots(metric_key);
CREATE INDEX idx_snapshots_period_start ON metric_snapshots(period_start);

-- daily_product_rollups: one aggregated metrics object per product per day.
CREATE TABLE daily_product_rollups (
  id           TEXT PRIMARY KEY,
  product_id   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rollup_date  TEXT NOT NULL,               -- YYYY-MM-DD
  metrics      TEXT NOT NULL,               -- JSON object of aggregated metrics
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  UNIQUE(product_id, rollup_date)
);
CREATE INDEX idx_rollups_product ON daily_product_rollups(product_id);
CREATE INDEX idx_rollups_date    ON daily_product_rollups(rollup_date);

-- ingestion_runs: track each connector sync run.
CREATE TABLE ingestion_runs (
  id                TEXT PRIMARY KEY,
  source_id         TEXT REFERENCES metric_sources(id) ON DELETE CASCADE,
  status            TEXT NOT NULL,          -- running | success | failed
  started_at        TEXT NOT NULL,
  finished_at       TEXT,
  records_ingested  INTEGER NOT NULL DEFAULT 0,
  error             TEXT,
  meta              TEXT                    -- JSON
);
CREATE INDEX idx_ingestion_source  ON ingestion_runs(source_id);
CREATE INDEX idx_ingestion_started ON ingestion_runs(started_at);

-- ai_summaries: generated briefings. scope 'company' has a null product_id.
CREATE TABLE ai_summaries (
  id           TEXT PRIMARY KEY,
  product_id   TEXT REFERENCES products(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL DEFAULT 'company',  -- company | product
  summary_date TEXT NOT NULL,               -- YYYY-MM-DD
  greeting     TEXT,
  headline     TEXT NOT NULL,
  summary      TEXT NOT NULL,
  meta         TEXT,                        -- JSON
  created_at   TEXT NOT NULL,
  CHECK (
    (scope = 'company' AND product_id IS NULL)
    OR (scope = 'product' AND product_id IS NOT NULL)
  )
);
CREATE INDEX idx_ai_summaries_date ON ai_summaries(summary_date);
CREATE UNIQUE INDEX idx_ai_summaries_company_unique
  ON ai_summaries(summary_date, scope)
  WHERE scope = 'company';
CREATE UNIQUE INDEX idx_ai_summaries_product_unique
  ON ai_summaries(product_id, summary_date, scope)
  WHERE scope = 'product';

-- alerts: surfaced exceptions for the dashboard.
CREATE TABLE alerts (
  id          TEXT PRIMARY KEY,
  product_id  TEXT REFERENCES products(id) ON DELETE CASCADE,
  severity    TEXT NOT NULL,                -- info | warning | critical
  status      TEXT NOT NULL DEFAULT 'open', -- open | acknowledged | resolved
  title       TEXT NOT NULL,
  detail      TEXT,
  source      TEXT,
  occurred_at TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_alerts_status ON alerts(status);

-- user_preferences: per-user settings stored as JSON.
CREATE TABLE user_preferences (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  preferences  TEXT NOT NULL,               -- JSON
  updated_at   TEXT NOT NULL,
  UNIQUE(user_id)
);
