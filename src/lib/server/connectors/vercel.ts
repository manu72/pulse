import type { ProductConnector } from './types';

// Future connector: fetch deployment status, build health and edge runtime signals from Vercel.
export const vercelConnector: ProductConnector = {
  source: 'Vercel',
  async getHealth() {
    return {
      source: 'Vercel',
      checkedAt: new Date().toISOString(),
      status: 'warning',
      summary: 'Vercel connector is not wired yet.'
    };
  }
};
