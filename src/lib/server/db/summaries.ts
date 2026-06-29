import { randomUUID } from 'node:crypto';
import type { Row } from '@libsql/client';
import { getDb } from './client';
import { jsonParse, jsonStringify } from './json';

export type DailyRollup = {
  id: string;
  productId: string;
  rollupDate: string;
  metrics: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type NewDailyRollup = Pick<
  DailyRollup,
  'productId' | 'rollupDate' | 'metrics'
>;

function rowToDailyRollup(row: Row): DailyRollup {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    rollupDate: String(row.rollup_date),
    metrics: jsonParse<Record<string, unknown>>(
      row.metrics as string | null,
      {}
    ),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function upsertDailyRollup(input: NewDailyRollup): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO daily_product_rollups
      (id, product_id, rollup_date, metrics, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, rollup_date) DO UPDATE SET
        metrics = excluded.metrics,
        updated_at = excluded.updated_at`,
    args: [
      randomUUID(),
      input.productId,
      input.rollupDate,
      jsonStringify(input.metrics),
      now,
      now
    ]
  });
}

export type AISummary = {
  id: string;
  productId: string | null;
  scope: 'company' | 'product';
  summaryDate: string;
  greeting: string | null;
  headline: string;
  summary: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export type LatestAISummaryFilter = {
  scope?: 'company' | 'product';
  productId?: string;
  summaryDate?: string;
};

function rowToAISummary(row: Row): AISummary {
  return {
    id: String(row.id),
    productId: row.product_id === null ? null : String(row.product_id),
    scope: String(row.scope) as AISummary['scope'],
    summaryDate: String(row.summary_date),
    greeting: row.greeting === null ? null : String(row.greeting),
    headline: String(row.headline),
    summary: String(row.summary),
    meta: jsonParse<Record<string, unknown> | null>(
      row.meta as string | null,
      null
    ),
    createdAt: String(row.created_at)
  };
}

export async function getLatestAISummary(
  filter: LatestAISummaryFilter = {}
): Promise<AISummary | null> {
  const db = getDb();
  const where: string[] = [];
  const args: Array<string | number> = [];
  if (filter.scope) {
    where.push('scope = ?');
    args.push(filter.scope);
  }
  if (filter.productId) {
    where.push('product_id = ?');
    args.push(filter.productId);
  }
  if (filter.summaryDate) {
    where.push('summary_date = ?');
    args.push(filter.summaryDate);
  }
  const sql = `SELECT * FROM ai_summaries
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY summary_date DESC, created_at DESC
    LIMIT 1`;
  const result = await db.execute({ sql, args });
  const row = result.rows[0];
  return row ? rowToAISummary(row) : null;
}
