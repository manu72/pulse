import {
  alerts,
  companyMetrics,
  dailyBriefing,
  recentActivity
} from '$lib/mock/overview';
import { products } from '$lib/mock/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    alerts,
    companyMetrics,
    dailyBriefing,
    products,
    recentActivity
  };
};
