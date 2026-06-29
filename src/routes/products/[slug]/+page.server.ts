import { getProductBySlug } from '$lib/mock/products';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const product = getProductBySlug(params.slug);

  if (!product) {
    error(404, 'Product not found');
  }

  return {
    product
  };
};
