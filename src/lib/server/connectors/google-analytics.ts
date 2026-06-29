import type { ProductConnector } from './types';

// Future connector: fetch GA4 sessions, acquisition channels and conversion events server-side.
export const googleAnalyticsConnector: ProductConnector = {
  source: 'Google Analytics',
  async getHealth() {
    return {
      source: 'Google Analytics',
      checkedAt: new Date().toISOString(),
      status: 'warning',
      summary: 'GA4 connector is not wired yet.'
    };
  }
};
