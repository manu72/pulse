<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { Product, ProductStatus } from '$lib/types/product';

  const statusTone: Record<ProductStatus, 'positive' | 'warning' | 'critical'> =
    {
      healthy: 'positive',
      watch: 'warning',
      attention: 'critical'
    };

  const statusLabel: Record<ProductStatus, string> = {
    healthy: 'Healthy',
    watch: 'Watch',
    attention: 'Needs attention'
  };

  const trendPrefix = {
    up: '+',
    down: '-',
    flat: ''
  };

  let { product }: { product: Product } = $props();
</script>

<a
  href={`/products/${product.slug}`}
  class="group block rounded-[2rem] border border-border bg-surface/80 p-5 transition motion-safe:hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-elevated focus-visible:translate-y-0 md:p-6"
  aria-label={`Open ${product.name} health detail`}
>
  <article>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm text-text-subtle">{product.topChannel}</p>
        <h3 class="mt-2 text-xl font-semibold tracking-[-0.03em] text-text">
          {product.name}
        </h3>
      </div>
      <Badge
        label={statusLabel[product.status]}
        tone={statusTone[product.status]}
      />
    </div>

    <p class="mt-5 min-h-12 text-sm leading-6 text-text-muted">
      {product.healthSummary}
    </p>

    <div class="mt-6 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-surface-muted/70 p-4">
        <p class="text-xs text-text-subtle">Visitors today</p>
        <p class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
          {product.visitorsToday.toLocaleString()}
        </p>
      </div>
      <div class="rounded-2xl bg-surface-muted/70 p-4">
        <p class="text-xs text-text-subtle">Conversion</p>
        <p class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
          {product.conversionRate}%
        </p>
      </div>
    </div>

    <div
      class="mt-5 flex items-center justify-between gap-4 text-sm text-text-muted"
    >
      <span
        >{trendPrefix[product.visitorsTrend.direction]}{product.visitorsTrend
          .percent}% visitors</span
      >
      <span class="text-text-subtle">{product.lastDeploy}</span>
    </div>
  </article>
</a>
