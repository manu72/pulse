import type { Product } from '$lib/types/product';

export const products: Product[] = [
  {
    name: 'Little Invites',
    slug: 'little-invites',
    url: 'https://littleinvites.us/',
    status: 'healthy',
    visitorsToday: 1248,
    visitorsTrend: { direction: 'up', percent: 18 },
    conversionRate: 7.4,
    topChannel: 'Organic search',
    healthSummary:
      'Strong birthday invitation traffic with healthy creation starts.',
    lastDeploy: 'Today, 9:12 AM',
    services: [
      { name: 'Landing site', provider: 'Vercel', status: 'online' },
      { name: 'Invite renderer', provider: 'Cloud Run', status: 'online' },
      { name: 'Asset storage', provider: 'Firebase', status: 'online' }
    ]
  },
  {
    name: 'Bible Buddy',
    slug: 'bible-buddy',
    url: 'https://biblebuddy.life/',
    status: 'healthy',
    visitorsToday: 2134,
    visitorsTrend: { direction: 'up', percent: 9 },
    conversionRate: 5.8,
    topChannel: 'Direct',
    healthSummary:
      'Companion discovery and signup intent are both tracking above baseline.',
    lastDeploy: 'Yesterday, 4:38 PM',
    services: [
      { name: 'App shell', provider: 'Vercel', status: 'online' },
      { name: 'Bible content', provider: 'Supabase', status: 'unknown' },
      { name: 'Checkout', provider: 'Stripe', status: 'online' }
    ]
  },
  {
    name: 'onesnap',
    slug: 'onesnap',
    url: 'https://onesnap.pro/',
    status: 'watch',
    visitorsToday: 684,
    visitorsTrend: { direction: 'down', percent: 6 },
    conversionRate: 3.2,
    topChannel: 'Referral',
    healthSummary:
      'Traffic is steady, but event creation has softened since the last deploy.',
    lastDeploy: 'Jun 28, 6:05 PM',
    services: [
      { name: 'Marketing site', provider: 'Vercel', status: 'online' },
      { name: 'Event API', provider: 'Cloud Run', status: 'degraded' },
      { name: 'Media storage', provider: 'Firebase', status: 'online' }
    ]
  },
  {
    name: 'SimTalk',
    slug: 'simtalk',
    url: 'https://simtalk.dev/',
    status: 'attention',
    visitorsToday: 402,
    visitorsTrend: { direction: 'flat', percent: 1 },
    conversionRate: 1.9,
    topChannel: 'Product Hunt',
    healthSummary:
      'The landing page is reachable, but engagement signals are below target.',
    lastDeploy: 'Jun 27, 11:44 AM',
    services: [
      { name: 'Landing site', provider: 'Vercel', status: 'online' },
      { name: 'Realtime bridge', provider: 'Cloud Run', status: 'unknown' },
      { name: 'Translation API', provider: 'Custom', status: 'unknown' }
    ]
  },
  {
    name: 'Throwing Eights',
    slug: 'throwing-eights',
    url: 'https://throwingeights.com.au/',
    status: 'healthy',
    visitorsToday: 1536,
    visitorsTrend: { direction: 'up', percent: 12 },
    conversionRate: 4.6,
    topChannel: 'LinkedIn',
    healthSummary:
      'Agency positioning is converting well with stable contact form activity.',
    lastDeploy: 'Today, 7:32 AM',
    services: [
      { name: 'Company site', provider: 'Vercel', status: 'online' },
      { name: 'Contact queue', provider: 'Supabase', status: 'unknown' },
      { name: 'Lead alerts', provider: 'Custom', status: 'online' }
    ]
  },
  {
    name: 'Rateio',
    slug: 'rateio',
    url: 'https://rateio.app/',
    status: 'watch',
    visitorsToday: 319,
    visitorsTrend: { direction: 'up', percent: 3 },
    conversionRate: 2.8,
    topChannel: 'Organic search',
    healthSummary:
      'Currency lookups are normal, but rate freshness needs monitoring.',
    lastDeploy: 'Jun 26, 2:19 PM',
    services: [
      { name: 'Web app', provider: 'Vercel', status: 'online' },
      { name: 'Rates API', provider: 'Custom', status: 'degraded' },
      { name: 'Cache layer', provider: 'Cloud Run', status: 'online' }
    ]
  },
  {
    name: 'SolarSim',
    slug: 'solarsim',
    url: 'https://solarsim.app/',
    status: 'healthy',
    visitorsToday: 782,
    visitorsTrend: { direction: 'up', percent: 21 },
    conversionRate: 6.1,
    topChannel: 'Social',
    healthSummary:
      'Interactive sessions are rising after the latest visual refresh.',
    lastDeploy: 'Yesterday, 8:21 PM',
    services: [
      { name: 'Simulation app', provider: 'Vercel', status: 'online' },
      { name: 'Texture assets', provider: 'Firebase', status: 'online' },
      { name: 'Telemetry', provider: 'Custom', status: 'unknown' }
    ]
  },
  {
    name: 'Lumo',
    slug: 'lumo',
    url: 'https://www.lumo.ninja/',
    status: 'healthy',
    visitorsToday: 4828,
    visitorsTrend: { direction: 'up', percent: 34 },
    conversionRate: 12.5,
    topChannel: 'TikTok',
    healthSummary:
      'Waitlist demand is accelerating with strong student acquisition.',
    lastDeploy: 'Today, 10:03 AM',
    services: [
      { name: 'Early access site', provider: 'Vercel', status: 'online' },
      { name: 'Waitlist database', provider: 'Supabase', status: 'unknown' },
      { name: 'Email capture', provider: 'Custom', status: 'online' }
    ]
  }
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);
