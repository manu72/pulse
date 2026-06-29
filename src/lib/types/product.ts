export type ProductStatus = 'healthy' | 'watch' | 'attention';

export type ServiceStatus = 'online' | 'degraded' | 'offline' | 'unknown';

export type TrendDirection = 'up' | 'down' | 'flat';

export type ProductService = {
  name: string;
  provider:
    | 'Vercel'
    | 'Firebase'
    | 'Cloud Run'
    | 'Supabase'
    | 'Stripe'
    | 'Paddle'
    | 'Custom';
  status: ServiceStatus;
};

export type Product = {
  name: string;
  slug: string;
  url: string;
  status: ProductStatus;
  visitorsToday: number;
  visitorsTrend: {
    direction: TrendDirection;
    percent: number;
  };
  conversionRate: number;
  topChannel: string;
  healthSummary: string;
  lastDeploy: string;
  services: ProductService[];
};
