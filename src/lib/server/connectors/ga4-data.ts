import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { randomUUID } from 'node:crypto';
import type { Client } from '@libsql/client';
import { jsonStringify } from '../db/json';

// Self-contained GA4 ingestion: takes an injected db client and credentials so
// it can run from both a SvelteKit server route ($env) and a standalone tsx
// script (process.env). It must NOT import $env or $lib — that would break the
// tsx path. Reads products + their GA4 metric_source config, pulls metrics,
// writes snapshots, a daily rollup, and an ingestion_runs row.

export type GA4SourceConfig = {
  ga4PropertyId: string;
  primaryDomain?: string;
  timezone?: string;
  displayOrder?: number;
  metadata?: Record<string, unknown>;
};

export type GA4ClientOptions = ConstructorParameters<
  typeof BetaAnalyticsDataClient
>[0];

/**
 * Resolve GA4 auth from whichever credential style is configured:
 * - GOOGLE_APPLICATION_CREDENTIALS (path to a service-account JSON key), or
 * - GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (inline; works on serverless), or
 * - nothing -> Application Default Credentials (GCP/Vercel metadata).
 */
export function resolveGA4Credentials(
  env: Record<string, string | undefined>
): GA4ClientOptions {
  const keyFilename = env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFilename) return { keyFilename };

  const clientEmail = env.GOOGLE_CLIENT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replaceAll('\\n', '\n');
  if (clientEmail && privateKey) {
    return {
      credentials: { client_email: clientEmail, private_key: privateKey }
    };
  }

  return {};
}

const METRICS = [
  { apiName: 'activeUsers', key: 'active_users', unit: 'count' },
  { apiName: 'sessions', key: 'sessions', unit: 'count' },
  { apiName: 'screenPageViews', key: 'screen_page_views', unit: 'count' },
  { apiName: 'engagementRate', key: 'engagement_rate', unit: 'percent' },
  { apiName: 'bounceRate', key: 'bounce_rate', unit: 'percent' },
  {
    apiName: 'averageSessionDuration',
    key: 'average_session_duration',
    unit: 'seconds'
  }
] as const;

type MetricValues = Record<string, number>;

type Period = {
  key: 'today' | 'yesterday' | 'last7';
  start: string;
  end: string;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function buildPeriods(): Period[] {
  const today = isoDate(new Date());
  return [
    { key: 'today', start: today, end: today },
    {
      key: 'yesterday',
      start: shiftDays(today, -1),
      end: shiftDays(today, -1)
    },
    { key: 'last7', start: shiftDays(today, -6), end: today }
  ];
}

async function fetchMetrics(
  client: BetaAnalyticsDataClient,
  property: string,
  period: Period
): Promise<MetricValues> {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: period.start, endDate: period.end }],
    metrics: METRICS.map((m) => ({ name: m.apiName }))
  });
  const row = response.rows?.[0];
  const values: MetricValues = {};
  for (const [i, metric] of METRICS.entries()) {
    const raw = row?.metricValues?.[i]?.value;
    values[metric.key] = raw == null || raw === '' ? 0 : Number(raw);
  }
  return values;
}

async function fetchTopDimension(
  client: BetaAnalyticsDataClient,
  property: string,
  period: Period,
  dimension: string,
  metricName: string
): Promise<string | null> {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: period.start, endDate: period.end }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: metricName }],
    orderBys: [{ metric: { metricName }, desc: true }],
    limit: 1
  });
  return response.rows?.[0]?.dimensionValues?.[0]?.value ?? null;
}

export type GA4ProductResult = {
  slug: string;
  propertyId: string;
  status: 'ok' | 'error' | 'skipped';
  snapshots: number;
  error?: string;
};

export type GA4IngestionResult = {
  status: 'success' | 'failed';
  startedAt: string;
  finishedAt: string;
  productsProcessed: number;
  productsOk: number;
  productsFailed: number;
  snapshotsWritten: number;
  results: GA4ProductResult[];
};

export type GA4IngestionInput = {
  db: Client;
  credentials: GA4ClientOptions;
};

function parseConfig(raw: unknown): GA4SourceConfig | null {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    return JSON.parse(raw) as GA4SourceConfig;
  } catch {
    return null;
  }
}

/**
 * Pull GA4 metrics for every product with an active GA4 metric_source and store
 * them. One broken property is caught and recorded, never breaking the rest.
 */
export async function runGA4Ingestion(
  input: GA4IngestionInput
): Promise<GA4IngestionResult> {
  const { db, credentials } = input;
  const startedAt = new Date().toISOString();
  const periods = buildPeriods();
  const today = periods[0].start;
  const client = new BetaAnalyticsDataClient(credentials);

  // ponytail: one GA4 report per period/dimension keeps parsing unambiguous.
  // Multiple date ranges in a single report could batch this if quota matters.
  const configured = await db.execute({
    sql: `SELECT p.id, p.slug, p.name, ms.id AS source_id, ms.config AS source_config
      FROM products p
      JOIN metric_sources ms ON ms.product_id = p.id
        AND ms.source = 'GA4' AND ms.is_active = 1
      ORDER BY p.name COLLATE NOCASE ASC`
  });

  const results: GA4ProductResult[] = [];
  let snapshotsWritten = 0;

  for (const row of configured.rows) {
    const productId = String(row.id);
    const slug = String(row.slug);
    const sourceId = row.source_id === null ? null : String(row.source_id);
    const config = parseConfig(row.source_config);
    const propertyId = config?.ga4PropertyId;

    if (!propertyId) {
      results.push({
        slug,
        propertyId: '',
        status: 'skipped',
        snapshots: 0,
        error: 'No ga4PropertyId configured'
      });
      continue;
    }

    try {
      const property = `properties/${propertyId}`;
      const byPeriod: Record<string, MetricValues> = {};
      for (const period of periods) {
        byPeriod[period.key] = await fetchMetrics(client, property, period);
      }
      const last7 = periods.find((p) => p.key === 'last7') as Period;
      const topChannel = await fetchTopDimension(
        client,
        property,
        last7,
        'defaultChannelGrouping',
        'activeUsers'
      );
      const topPage = await fetchTopDimension(
        client,
        property,
        last7,
        'pagePath',
        'screenPageViews'
      );

      const todayVals = byPeriod.today;
      const rollupMetrics = {
        activeUsersToday: todayVals.active_users,
        activeUsersYesterday: byPeriod.yesterday.active_users,
        activeUsers7d: byPeriod.last7.active_users,
        sessionsToday: todayVals.sessions,
        screenPageViewsToday: todayVals.screen_page_views,
        engagementRateToday: todayVals.engagement_rate,
        bounceRateToday: todayVals.bounce_rate,
        averageSessionDurationToday: todayVals.average_session_duration,
        topChannel,
        topPage,
        timezone: config?.timezone ?? null
      };

      type Statement = {
        sql: string;
        args: Array<string | number | null>;
      };
      const statements: Statement[] = [];

      for (const period of periods) {
        const vals = byPeriod[period.key];
        for (const metric of METRICS) {
          statements.push({
            sql: `INSERT INTO metric_snapshots
              (id, product_id, source_id, metric_key, metric_value, unit, period_start, period_end, dimensions, captured_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              randomUUID(),
              productId,
              sourceId,
              metric.key,
              vals[metric.key] ?? 0,
              metric.unit,
              period.start,
              period.end,
              null,
              startedAt
            ]
          });
        }
      }

      statements.push({
        sql: `INSERT INTO daily_product_rollups
          (id, product_id, rollup_date, metrics, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(product_id, rollup_date) DO UPDATE SET
            metrics = excluded.metrics,
            updated_at = excluded.updated_at`,
        args: [
          randomUUID(),
          productId,
          today,
          jsonStringify(rollupMetrics),
          startedAt,
          startedAt
        ]
      });

      await db.batch(statements);
      const snapshotCount = periods.length * METRICS.length;
      snapshotsWritten += snapshotCount;
      results.push({
        slug,
        propertyId,
        status: 'ok',
        snapshots: snapshotCount
      });
    } catch (err) {
      results.push({
        slug,
        propertyId,
        status: 'error',
        snapshots: 0,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  const finishedAt = new Date().toISOString();
  const productsOk = results.filter((r) => r.status === 'ok').length;
  const productsFailed = results.filter((r) => r.status === 'error').length;
  const status: GA4IngestionResult['status'] =
    productsOk > 0 ? 'success' : 'failed';

  await db.execute({
    sql: `INSERT INTO ingestion_runs
      (id, source_id, status, started_at, finished_at, records_ingested, error, meta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      null,
      status,
      startedAt,
      finishedAt,
      snapshotsWritten,
      productsFailed > 0
        ? `${productsFailed} product(s) failed; see meta`
        : null,
      jsonStringify({
        source: 'GA4',
        productsProcessed: results.length,
        productsOk,
        productsFailed,
        errors: results
          .filter((r) => r.error)
          .map((r) => ({ slug: r.slug, error: r.error }))
      })
    ]
  });

  return {
    status,
    startedAt,
    finishedAt,
    productsProcessed: results.length,
    productsOk,
    productsFailed,
    snapshotsWritten,
    results
  };
}
