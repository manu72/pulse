import type { ProductStatus } from './product';

export type CompanyMetric = {
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export type ActivityItem = {
  product: string;
  label: string;
  time: string;
  tone: 'neutral' | 'positive' | 'warning';
};

export type AlertItem = {
  product: string;
  title: string;
  summary: string;
  status: Extract<ProductStatus, 'watch' | 'attention'>;
};

export type DailyBriefing = {
  greeting: string;
  headline: string;
  summary: string;
  generatedAt: string;
};
