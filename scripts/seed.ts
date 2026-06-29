import { randomUUID } from 'node:crypto';
import { getScriptDb } from './db';
import { products } from '../src/lib/mock/products';
import { jsonStringify } from '../src/lib/server/db/json';

const db = getScriptDb();
const now = new Date().toISOString();

// GA4 source config per product. Property IDs are placeholders — replace them
// with real GA4 property IDs (numeric) before running ingestion. See README.
type GA4Config = {
  ga4PropertyId: string;
  primaryDomain: string;
  timezone: string;
  displayOrder: number;
  metadata: Record<string, unknown>;
};

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

for (const [index, product] of products.entries()) {
  // Upsert product by slug so the seed is safe to run repeatedly. The product id
  // is stable across re-seeds (ON CONFLICT does not touch id).
  await db.execute({
    sql: `INSERT INTO products
      (id, slug, name, url, status, visitors_today, visitors_trend, conversion_rate, top_channel, health_summary, last_deploy, services, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        url = excluded.url,
        status = excluded.status,
        visitors_today = excluded.visitors_today,
        visitors_trend = excluded.visitors_trend,
        conversion_rate = excluded.conversion_rate,
        top_channel = excluded.top_channel,
        health_summary = excluded.health_summary,
        last_deploy = excluded.last_deploy,
        services = excluded.services,
        updated_at = excluded.updated_at`,
    args: [
      randomUUID(),
      product.slug,
      product.name,
      product.url,
      product.status,
      product.visitorsToday,
      jsonStringify(product.visitorsTrend),
      product.conversionRate,
      product.topChannel,
      product.healthSummary,
      product.lastDeploy,
      jsonStringify(product.services),
      now,
      now
    ]
  });

  const productId = String(
    (
      await db.execute({
        sql: 'SELECT id FROM products WHERE slug = ?',
        args: [product.slug]
      })
    ).rows[0]?.id
  );

  const config: GA4Config = {
    ga4PropertyId: String(100000000 + index),
    primaryDomain: domainFromUrl(product.url),
    timezone: 'Australia/Melbourne',
    displayOrder: index,
    metadata: {}
  };

  await db.execute({
    sql: `INSERT INTO metric_sources
      (id, product_id, source, display_name, is_active, config, created_at)
      VALUES (?, ?, 'GA4', ?, 1, ?, ?)
      ON CONFLICT(product_id, source) DO UPDATE SET
        display_name = excluded.display_name,
        is_active = excluded.is_active,
        config = COALESCE(metric_sources.config, excluded.config)`,
    args: [
      randomUUID(),
      productId,
      `GA4 — ${product.name}`,
      jsonStringify(config),
      now
    ]
  });

  console.log('Seeded:', product.slug);
}

console.log(`Seeded ${products.length} products.`);
await db.close();
