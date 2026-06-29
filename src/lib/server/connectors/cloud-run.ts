import type { ProductConnector } from './types';

// Future connector: fetch Cloud Run revision, latency and error budget signals.
export const cloudRunConnector: ProductConnector = {
  source: 'Cloud Run',
  async getHealth() {
    return {
      source: 'Cloud Run',
      checkedAt: new Date().toISOString(),
      status: 'warning',
      summary: 'Cloud Run connector is not wired yet.'
    };
  }
};
