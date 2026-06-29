<script lang="ts">
  import MetricCard from '$lib/components/ui/MetricCard.svelte';
  import type { CompanyMetric } from '$lib/types/overview';

  let { metrics }: { metrics: CompanyMetric[] } = $props();
</script>

<section aria-labelledby="company-metrics-heading">
  <div class="mb-4 flex items-end justify-between gap-4">
    <div>
      <p
        class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle"
      >
        Company-wide metrics
      </p>
      <h2
        id="company-metrics-heading"
        class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text"
      >
        Business health at a glance
      </h2>
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each metrics as metric}
      <MetricCard {metric} />
    {/each}
  </div>
</section>
