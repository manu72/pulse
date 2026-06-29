import type { Row } from '@libsql/client';
import type { Product, ProductStatus } from '$lib/types/product';
import { getDb } from './client';
import { jsonParse } from './json';

function rowToProduct(row: Row): Product {
  return {
    name: String(row.name),
    slug: String(row.slug),
    url: String(row.url),
    status: String(row.status) as ProductStatus,
    visitorsToday: Number(row.visitors_today),
    visitorsTrend: jsonParse<Product['visitorsTrend']>(
      row.visitors_trend as string | null,
      { direction: 'flat', percent: 0 }
    ),
    conversionRate: Number(row.conversion_rate),
    topChannel: String(row.top_channel),
    healthSummary: String(row.health_summary),
    lastDeploy: String(row.last_deploy),
    services: jsonParse<Product['services']>(row.services as string | null, [])
  };
}

export async function listProducts(): Promise<Product[]> {
  const db = getDb();
  const result = await db.execute(
    'SELECT * FROM products ORDER BY name COLLATE NOCASE ASC'
  );
  return result.rows.map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM products WHERE slug = ? LIMIT 1',
    args: [slug]
  });
  const row = result.rows[0];
  return row ? rowToProduct(row) : null;
}
