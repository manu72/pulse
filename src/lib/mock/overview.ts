import type {
  ActivityItem,
  AlertItem,
  CompanyMetric,
  DailyBriefing
} from '$lib/types/overview';

export const dailyBriefing: DailyBriefing = {
  greeting: 'Good morning, Manu.',
  headline: 'Everything important is visible from here.',
  summary:
    'Most products are healthy today. Lumo and Little Invites are carrying the strongest demand, while SimTalk and Rateio are worth a closer look before the afternoon check-in.',
  generatedAt: 'Mock briefing for today'
};

export const companyMetrics: CompanyMetric[] = [
  {
    label: 'Visitors today',
    value: '11.9k',
    change: '+18% vs yesterday',
    tone: 'positive'
  },
  {
    label: 'Avg conversion',
    value: '5.5%',
    change: '+0.7 pts this week',
    tone: 'positive'
  },
  {
    label: 'Products healthy',
    value: '5 / 8',
    change: '2 watching, 1 attention',
    tone: 'warning'
  },
  {
    label: 'Last deploy',
    value: '10:03 AM',
    change: 'Lumo early access site',
    tone: 'neutral'
  }
];

export const recentActivity: ActivityItem[] = [
  {
    product: 'Lumo',
    label: 'Waitlist conversion crossed 12% after the morning traffic spike.',
    time: '18 min ago',
    tone: 'positive'
  },
  {
    product: 'Throwing Eights',
    label: 'Contact form submissions remain above the seven-day average.',
    time: '42 min ago',
    tone: 'positive'
  },
  {
    product: 'onesnap',
    label: 'Event API response time moved into the watch range.',
    time: '1 hr ago',
    tone: 'warning'
  },
  {
    product: 'SolarSim',
    label: 'Session depth improved after the latest visual refresh.',
    time: '2 hrs ago',
    tone: 'neutral'
  }
];

export const alerts: AlertItem[] = [
  {
    product: 'SimTalk',
    title: 'Engagement below target',
    summary:
      'Landing traffic is stable, but the current page is not producing enough start intent.',
    status: 'attention'
  },
  {
    product: 'Rateio',
    title: 'Rates freshness needs review',
    summary:
      'The mock rates service is marked degraded so future connector wiring has a visible alert path.',
    status: 'watch'
  },
  {
    product: 'onesnap',
    title: 'Event creation softened',
    summary:
      'Traffic remains useful, but conversion should be reviewed after the next deploy.',
    status: 'watch'
  }
];
