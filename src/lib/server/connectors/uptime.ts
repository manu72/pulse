import type { ProductConnector } from './types';

// Future connector: fetch uptime checks and incident state from the monitoring provider.
export const uptimeConnector: ProductConnector = {
  source: 'Uptime',
  async getHealth() {
    return {
      source: 'Uptime',
      checkedAt: new Date().toISOString(),
      status: 'warning',
      summary: 'Uptime connector is not wired yet.'
    };
  }
};
