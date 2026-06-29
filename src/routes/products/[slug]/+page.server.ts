import { error } from '@sveltejs/kit';
import { getProductBySlug as getMockProductBySlug } from '$lib/mock/products';
import { isDbConfigured } from '$lib/server/db/client';
import { getProductBySlug } from '$lib/server/db/products';
import type { Product } from '$lib/types/product';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Database product data when available; mock fallback only if the database
  // layer is unavailable (not configured or errors). A configured-but-missing
  // slug is a real 404.
  let product: Product | null;

  if (isDbConfigured()) {
    try {
      product = await getProductBySlug(params.slug);
    } catch {
      product = getMockProductBySlug(params.slug) ?? null;
    }
  } else {
    product = getMockProductBySlug(params.slug) ?? null;
  }

  if (!product) {
    error(404, 'Product not found');
  }

  return { product };
};
