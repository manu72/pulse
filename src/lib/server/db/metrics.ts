import { randomUUID } from 'node:crypto';
import type { Row } from '@libsql/client';
import { getDb } from './client';
import { jsonParse, jsonStringify } from './json';

export type MetricSnapshot = {
  id: string;
  productId: string;
  sourceId: string | null;
  metricKey: string;
  metricValue: number;
  unit: string | null;
  periodStart: string;
  periodEnd: string;
  dimensions: Record<string, unknown> | null;
  capturedAt: string;
};

export type NewMetricSnapshot = Omit<MetricSnapshot, 'id'>;

function rowToMetricSnapshot(row: Row): MetricSnapshot {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    sourceId: row.source_id === null ? null : String(row.source_id),
    metricKey: String(row.metric_key),
    metricValue: Number(row.metric_value),
    unit: row.unit === null ? null : String(row.unit),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    dimensions: jsonParse<Record<string, unknown> | null>(
      row.dimensions as string | null,
      null
    ),
    capturedAt: String(row.captured_at)
  };
}

export async function insertMetricSnapshot(
  input: NewMetricSnapshot
): Promise<string> {
  const id = randomUUID();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO metric_snapshots
      (id, product_id, source_id, metric_key, metric_value, unit, period_start, period_end, dimensions, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.productId,
      input.sourceId,
      input.metricKey,
      input.metricValue,
      input.unit,
      input.periodStart,
      input.periodEnd,
      input.dimensions ? jsonStringify(input.dimensions) : null,
      input.capturedAt
    ]
  });
  return id;
}

export type LatestMetricSnapshotFilter = {
  productId?: string;
  sourceId?: string;
  metricKey?: string;
  limit?: number;
};

export async function getLatestMetricSnapshots(
  filter: LatestMetricSnapshotFilter = {}
): Promise<MetricSnapshot[]> {
  const db = getDb();
  const where: string[] = [];
  const args: Array<string | number> = [];
  if (filter.productId) {
    where.push('product_id = ?');
    args.push(filter.productId);
  }
  if (filter.sourceId) {
    where.push('source_id = ?');
    args.push(filter.sourceId);
  }
  if (filter.metricKey) {
    where.push('metric_key = ?');
    args.push(filter.metricKey);
  }
  const sql = `SELECT * FROM metric_snapshots
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY period_start DESC, captured_at DESC
    LIMIT ?`;
  args.push(filter.limit ?? 100);
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToMetricSnapshot);
}

export type ProductMetricSnapshot = MetricSnapshot & { productSlug: string };

function rowToProductMetricSnapshot(row: Row): ProductMetricSnapshot {
  return { ...rowToMetricSnapshot(row), productSlug: String(row.product_slug) };
}

/**
 * Latest N snapshots per product for a single metric key, resolved by slug.
 * One window-function query instead of one per product. Used by the dashboard
 * to overlay real GA4 numbers onto product cards.
 */
export async function getLatestSnapshotsByProductSlugs(
  slugs: string[],
  metricKey: string,
  perProduct = 3
): Promise<ProductMetricSnapshot[]> {
  if (!slugs.length) return [];
  const db = getDb();
  const placeholders = slugs.map(() => '?').join(',');
  const args: Array<string | number> = [...slugs, metricKey, perProduct];
  const sql = `SELECT * FROM (
      SELECT
        s.id, s.product_id, s.source_id, s.metric_key, s.metric_value, s.unit,
        s.period_start, s.period_end, s.dimensions, s.captured_at,
        p.slug AS product_slug,
        ROW_NUMBER() OVER (
          PARTITION BY s.product_id
          ORDER BY s.period_start DESC, s.captured_at DESC
        ) AS rn
      FROM metric_snapshots s
      JOIN products p ON p.id = s.product_id
      WHERE p.slug IN (${placeholders}) AND s.metric_key = ?
    )
    WHERE rn <= ?
    ORDER BY product_slug, period_start DESC`;
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToProductMetricSnapshot);
}
