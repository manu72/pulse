import {
  alerts,
  companyMetrics,
  dailyBriefing,
  recentActivity
} from '$lib/mock/overview';
import { products as mockProducts } from '$lib/mock/products';
import { isDbConfigured } from '$lib/server/db/client';
import { listProducts } from '$lib/server/db/products';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async () => {
  return {
    alerts,
    companyMetrics,
    dailyBriefing,
    products: await loadProducts(),
    recentActivity
  };
};
