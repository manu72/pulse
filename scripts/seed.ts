import { getScriptDb } from './db';
import { products } from '../src/lib/mock/products';
import { jsonStringify } from '../src/lib/server/db/json';

const db = getScriptDb();
const now = new Date().toISOString();

// Upsert by slug so the seed is safe to run repeatedly.
for (const product of products) {
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
      crypto.randomUUID(),
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
  console.log('Seeded:', product.slug);
}

console.log(`Seeded ${products.length} products.`);
await db.close();
