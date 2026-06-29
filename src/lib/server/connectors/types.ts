import type { Product } from '$lib/types/product';

export type ConnectorHealth = {
  source: string;
  checkedAt: string;
  status: 'ok' | 'warning' | 'error';
  summary: string;
};

export type ProductConnector = {
  source: string;
  getHealth(product: Product): Promise<ConnectorHealth>;
};
