import { isDbConfigured } from './db/client';
import { getLatestSnapshotsByProductSlugs } from './db/metrics';
import { getRollupsForSlugsAndDate } from './db/summaries';
import type { Product } from '$lib/types/product';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/**
 * Overlay latest stored GA4 numbers onto product cards. Falls back silently to
 * each product's existing (mock) values whenever snapshots are missing, so the
 * homepage never breaks. Components are untouched — they already render Product.
 */
export async function hydrateProductMetrics(
  products: Product[]
): Promise<Product[]> {
  if (!isDbConfigured() || products.length === 0) return products;

  const slugs = products.map((p) => p.slug);
  const today = isoDate(new Date());
  const yesterday = shiftDays(today, -1);

  try {
    const [snapshots, rollups] = await Promise.all([
      getLatestSnapshotsByProductSlugs(slugs, 'active_users', 2),
      getRollupsForSlugsAndDate(slugs, today)
    ]);

    const usersBySlug = new Map<
      string,
      { today?: number; yesterday?: number }
    >();
    for (const s of snapshots) {
      const entry = usersBySlug.get(s.productSlug) ?? {};
      if (s.periodStart === today) entry.today = s.metricValue;
      else if (s.periodStart === yesterday) entry.yesterday = s.metricValue;
      usersBySlug.set(s.productSlug, entry);
    }

    const channelBySlug = new Map<string, string>();
    for (const r of rollups) {
      const channel = r.metrics.topChannel;
      if (typeof channel === 'string' && channel) {
        channelBySlug.set(r.productSlug, channel);
      }
    }

    return products.map((product) => {
      const users = usersBySlug.get(product.slug);
      const overlay: Partial<Product> = {};

      if (users?.today !== undefined) {
        overlay.visitorsToday = Math.round(users.today);
        if (users.yesterday !== undefined && users.yesterday > 0) {
          const pct = Math.round(
            ((users.today - users.yesterday) / users.yesterday) * 100
          );
          overlay.visitorsTrend = {
            direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
            percent: Math.abs(pct)
          };
        }
      }

      const channel = channelBySlug.get(product.slug);
      if (channel) overlay.topChannel = channel;

      return { ...product, ...overlay };
    });
  } catch {
    return products;
  }
}
