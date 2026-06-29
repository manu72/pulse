<script lang="ts">
  import type { CompanyMetric } from '$lib/types/overview';

  const toneClasses: Record<CompanyMetric['tone'], string> = {
    positive: 'text-positive',
    neutral: 'text-text-muted',
    warning: 'text-warning'
  };

  let { metric }: { metric: CompanyMetric } = $props();
</script>

<article class="rounded-3xl border border-border bg-surface-elevated/80 p-5">
  <p class="text-sm text-text-muted">{metric.label}</p>
  <p class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text">
    {metric.value}
  </p>
  <p class={`mt-2 text-sm ${toneClasses[metric.tone]}`}>{metric.change}</p>
</article>
