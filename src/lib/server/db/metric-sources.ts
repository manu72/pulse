import type { Row } from '@libsql/client';
import { getDb } from './client';
import { jsonParse } from './json';

type GA4Config = {
  timezone?: string;
};

export type ProductGA4SourceConfig = {
  productSlug: string;
  timezone: string | null;
};

function rowToProductGA4SourceConfig(row: Row): ProductGA4SourceConfig {
  const config = jsonParse<GA4Config>(row.source_config as string | null, {});
  return {
    productSlug: String(row.product_slug),
    timezone: typeof config.timezone === 'string' ? config.timezone : null
  };
}

export async function listActiveGA4SourceConfigs(
  slugs?: string[]
): Promise<ProductGA4SourceConfig[]> {
  if (slugs && slugs.length === 0) return [];

  const db = getDb();
  const where = slugs
    ? `AND p.slug IN (${slugs.map(() => '?').join(',')})`
    : '';
  const result = await db.execute({
    sql: `SELECT p.slug AS product_slug, ms.config AS source_config
      FROM products p
      JOIN metric_sources ms ON ms.product_id = p.id
        AND ms.source = 'GA4' AND ms.is_active = 1
      ${where}
      ORDER BY p.name COLLATE NOCASE ASC`,
    args: slugs ?? []
  });

  return result.rows.map(rowToProductGA4SourceConfig);
}
