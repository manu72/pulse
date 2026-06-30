import { isDbConfigured } from './db/client';
import { listActiveGA4SourceConfigs } from './db/metric-sources';
import { getLatestSnapshotsByProductSlugs } from './db/metrics';
import { getRollupsForProductSlugDates } from './db/summaries';
import {
  DEFAULT_TIME_ZONE,
  currentDateInTimeZone,
  shiftCalendarDays
} from './dates';
import type { Product } from '$lib/types/product';

type ProductCalendar = {
  today: string;
  yesterday: string;
};

function calendarForTimeZone(
  timeZone: string,
  now: Date
): ProductCalendar | null {
  try {
    const today = currentDateInTimeZone(timeZone, now);
    return { today, yesterday: shiftCalendarDays(today, -1) };
  } catch {
    return null;
  }
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
  const now = new Date();

  try {
    const [snapshots, sourceConfigs] = await Promise.all([
      getLatestSnapshotsByProductSlugs(slugs, 'active_users', 2),
      listActiveGA4SourceConfigs(slugs)
    ]);
    const defaultCalendar = calendarForTimeZone(DEFAULT_TIME_ZONE, now);
    const calendarBySlug = new Map<string, ProductCalendar | null>(
      products.map((product) => [product.slug, defaultCalendar])
    );
    for (const sourceConfig of sourceConfigs) {
      calendarBySlug.set(
        sourceConfig.productSlug,
        calendarForTimeZone(sourceConfig.timezone || DEFAULT_TIME_ZONE, now)
      );
    }

    const rollups = await getRollupsForProductSlugDates(
      products.flatMap((product) => {
        const calendar = calendarBySlug.get(product.slug);
        return calendar
          ? [{ productSlug: product.slug, rollupDate: calendar.today }]
          : [];
      })
    );

    const usersBySlug = new Map<
      string,
      { today?: number; yesterday?: number }
    >();
    for (const s of snapshots) {
      const calendar = calendarBySlug.get(s.productSlug);
      if (!calendar) continue;
      const entry = usersBySlug.get(s.productSlug) ?? {};
      if (s.periodStart === calendar.today) entry.today = s.metricValue;
      else if (s.periodStart === calendar.yesterday) {
        entry.yesterday = s.metricValue;
      }
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
