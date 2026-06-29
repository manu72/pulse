import type { ProductConnector } from './types';

// Future connector: fetch Firebase app, auth, hosting and storage health from server-side credentials.
export const firebaseConnector: ProductConnector = {
  source: 'Firebase',
  async getHealth() {
    return {
      source: 'Firebase',
      checkedAt: new Date().toISOString(),
      status: 'warning',
      summary: 'Firebase connector is not wired yet.'
    };
  }
};
