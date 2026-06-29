import type { Product } from '$lib/types/product';
import type { ConnectorHealth, ProductConnector } from './connectors';

// Future aggregation boundary: combine connector output before route load functions receive it.
export const collectProductHealth = async (
  product: Product,
  connectors: ProductConnector[]
): Promise<ConnectorHealth[]> => {
  return Promise.all(
    connectors.map((connector) => connector.getHealth(product))
  );
};
