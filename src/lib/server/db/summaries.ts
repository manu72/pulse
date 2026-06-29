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

export type ProductDailyRollup = DailyRollup & { productSlug: string };

export type CompanyRollup = DailyRollup & {
  productSlug: string;
  productName: string;
  productStatus: string;
};

function rowToProductDailyRollup(row: Row): ProductDailyRollup {
  return { ...rowToDailyRollup(row), productSlug: String(row.product_slug) };
}

/** Rollups for a set of products on a given date, resolved by slug. */
export async function getRollupsForSlugsAndDate(
  slugs: string[],
  rollupDate: string
): Promise<ProductDailyRollup[]> {
  if (!slugs.length) return [];
  const db = getDb();
  const placeholders = slugs.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT r.*, p.slug AS product_slug
      FROM daily_product_rollups r
      JOIN products p ON p.id = r.product_id
      WHERE p.slug IN (${placeholders}) AND r.rollup_date = ?`,
    args: [...slugs, rollupDate]
  });
  return result.rows.map(rowToProductDailyRollup);
}

/** All product rollups for a date, with product identity for the AI briefing. */
export async function getRollupsForDate(
  rollupDate: string
): Promise<CompanyRollup[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT r.*, p.slug AS product_slug, p.name AS product_name, p.status AS product_status
      FROM daily_product_rollups r
      JOIN products p ON p.id = r.product_id
      WHERE r.rollup_date = ?
      ORDER BY p.name COLLATE NOCASE ASC`,
    args: [rollupDate]
  });
  return result.rows.map((row) => ({
    ...rowToDailyRollup(row),
    productSlug: String(row.product_slug),
    productName: String(row.product_name),
    productStatus: String(row.product_status)
  }));
}

export type NewAISummary = {
  productId: string | null;
  scope: 'company' | 'product';
  summaryDate: string;
  greeting: string | null;
  headline: string;
  summary: string;
  meta: Record<string, unknown> | null;
};

/**
 * Store a generated briefing. Clears any existing same-scope summary for the
 * date first (within a transaction) so regenerating the same day replaces it.
 */
export async function saveAISummary(input: NewAISummary): Promise<string> {
  const id = randomUUID();
  const db = getDb();
  const now = new Date().toISOString();
  const deleteStmt =
    input.scope === 'company'
      ? {
          sql: 'DELETE FROM ai_summaries WHERE summary_date = ? AND scope = ?',
          args: [input.summaryDate, input.scope]
        }
      : {
          sql: 'DELETE FROM ai_summaries WHERE summary_date = ? AND scope = ? AND product_id = ?',
          args: [input.summaryDate, input.scope, input.productId]
        };
  await db.batch([
    deleteStmt,
    {
      sql: `INSERT INTO ai_summaries
        (id, product_id, scope, summary_date, greeting, headline, summary, meta, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        input.productId,
        input.scope,
        input.summaryDate,
        input.greeting,
        input.headline,
        input.summary,
        input.meta ? jsonStringify(input.meta) : null,
        now
      ]
    }
  ]);
  return id;
}
