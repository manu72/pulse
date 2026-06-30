import {
  alerts,
  companyMetrics,
  dailyBriefing as mockBriefing,
  recentActivity
} from '$lib/mock/overview';
import { products as mockProducts } from '$lib/mock/products';
import { isDbConfigured } from '$lib/server/db/client';
import { listProducts } from '$lib/server/db/products';
import { getLatestAISummary, type AISummary } from '$lib/server/db/summaries';
import { hydrateProductMetrics } from '$lib/server/dashboard';
import type { DailyBriefing } from '$lib/types/overview';
import type { PageServerLoad } from './$types';

export type BriefingStatus = 'live' | 'empty' | 'mock';

// Read products from Turso when configured; fall back to mock data otherwise
// (local dev without a database, an empty database, or any runtime error).
async function loadProducts() {
  if (!isDbConfigured()) return mockProducts;
  try {
    const dbProducts = await listProducts();
    return dbProducts.length ? dbProducts : mockProducts;
  } catch {
    return mockProducts;
  }
}

const EMPTY_BRIEFING: DailyBriefing = {
  greeting: 'Good morning.',
  headline: 'Daily AI briefing',
  summary:
    'Pulse is ready to generate the first briefing once analytics snapshots are available.',
  generatedAt: 'Awaiting first snapshot'
};

function toBriefing(summary: AISummary): DailyBriefing {
  return {
    greeting: summary.greeting ?? 'Good morning.',
    headline: summary.headline,
    summary: summary.summary,
    generatedAt: summary.createdAt
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadBriefing(): Promise<{
  briefing: DailyBriefing;
  status: BriefingStatus;
}> {
  if (!isDbConfigured()) return { briefing: mockBriefing, status: 'mock' };
  try {
    const summary = await getLatestAISummary({
      scope: 'company',
      summaryDate: todayIso()
    });
    if (!summary) return { briefing: EMPTY_BRIEFING, status: 'empty' };
    return { briefing: toBriefing(summary), status: 'live' };
  } catch {
    return { briefing: mockBriefing, status: 'mock' };
  }
}

export const load: PageServerLoad = async () => {
  const products = await loadProducts();
  const { briefing, status } = await loadBriefing();
  return {
    alerts,
    companyMetrics,
    dailyBriefing: briefing,
    briefingStatus: status,
    products: await hydrateProductMetrics(products),
    recentActivity
  };
};
