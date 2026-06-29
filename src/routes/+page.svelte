<script lang="ts">
  import ActivityFeed from '$lib/components/dashboard/ActivityFeed.svelte';
  import AlertList from '$lib/components/dashboard/AlertList.svelte';
  import CompanyMetrics from '$lib/components/dashboard/CompanyMetrics.svelte';
  import DailyBriefing from '$lib/components/dashboard/DailyBriefing.svelte';
  import ProductHealthGrid from '$lib/components/dashboard/ProductHealthGrid.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Pulse | Executive Overview</title>
  <meta
    name="description"
    content="A premium executive overview for monitoring Throwing Eights product health."
  />
</svelte:head>

<div class="space-y-8">
  <DailyBriefing briefing={data.dailyBriefing} status={data.briefingStatus} />
  <CompanyMetrics metrics={data.companyMetrics} />
  <ProductHealthGrid products={data.products} />

  <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <ActivityFeed items={data.recentActivity} />
    <AlertList alerts={data.alerts} />
  </div>
</div>
