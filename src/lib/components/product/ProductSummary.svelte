<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import Surface from '$lib/components/ui/Surface.svelte';
  import type {
    Product,
    ProductStatus,
    ServiceStatus
  } from '$lib/types/product';

  const statusTone: Record<ProductStatus, 'positive' | 'warning' | 'critical'> =
    {
      healthy: 'positive',
      watch: 'warning',
      attention: 'critical'
    };

  const serviceTone: Record<
    ServiceStatus,
    'positive' | 'warning' | 'critical' | 'neutral'
  > = {
    online: 'positive',
    degraded: 'warning',
    offline: 'critical',
    unknown: 'neutral'
  };

  let { product }: { product: Product } = $props();
</script>

<div class="space-y-6">
  <Surface class="p-6 md:p-8">
    <a href="/" class="text-sm text-text-muted hover:text-text"
      >Back to overview</a
    >

    <div
      class="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <Badge label={product.status} tone={statusTone[product.status]} />
        <h1
          class="mt-5 text-4xl font-semibold tracking-[-0.06em] text-text md:text-6xl"
        >
          {product.name}
        </h1>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-text-muted">
          {product.healthSummary}
        </p>
      </div>

      <a
        href={product.url}
        rel="noreferrer"
        target="_blank"
        class="inline-flex w-fit items-center justify-center rounded-full border border-border bg-surface-elevated px-5 py-3 text-sm font-medium text-text-muted hover:border-border-strong hover:text-text"
      >
        Visit product
      </a>
    </div>
  </Surface>

  <section
    class="grid gap-4 md:grid-cols-3"
    aria-label={`${product.name} key metrics`}
  >
    <article class="rounded-3xl border border-border bg-surface/80 p-5">
      <p class="text-sm text-text-subtle">Visitors today</p>
      <p class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text">
        {product.visitorsToday.toLocaleString()}
      </p>
    </article>
    <article class="rounded-3xl border border-border bg-surface/80 p-5">
      <p class="text-sm text-text-subtle">Conversion rate</p>
      <p class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text">
        {product.conversionRate}%
      </p>
    </article>
    <article class="rounded-3xl border border-border bg-surface/80 p-5">
      <p class="text-sm text-text-subtle">Top channel</p>
      <p class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text">
        {product.topChannel}
      </p>
    </article>
  </section>

  <Surface>
    <div class="flex flex-col gap-2">
      <p
        class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle"
      >
        Services
      </p>
      <h2 class="text-2xl font-semibold tracking-[-0.04em] text-text">
        Connected services placeholder
      </h2>
      <p class="max-w-2xl text-sm leading-6 text-text-muted">
        These service rows are mock data for now. Future server connectors
        should hydrate them from Vercel, Cloud Run, Firebase, Supabase, uptime
        checks and billing systems.
      </p>
    </div>

    <div class="mt-6 grid gap-3">
      {#each product.services as service}
        <article
          class="flex items-center justify-between gap-4 rounded-2xl bg-surface-muted/70 p-4"
        >
          <div>
            <h3 class="font-medium text-text">{service.name}</h3>
            <p class="mt-1 text-sm text-text-subtle">{service.provider}</p>
          </div>
          <Badge label={service.status} tone={serviceTone[service.status]} />
        </article>
      {/each}
    </div>
  </Surface>
</div>
