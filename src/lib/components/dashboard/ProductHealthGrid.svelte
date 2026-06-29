<script lang="ts">
  import ProductHealthCard from '$lib/components/dashboard/ProductHealthCard.svelte';
  import type { Product } from '$lib/types/product';

  let { products }: { products: Product[] } = $props();
</script>

<section aria-labelledby="product-health-heading">
  <div class="mb-4">
    <p class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle">
      Product health cards
    </p>
    <h2
      id="product-health-heading"
      class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text"
    >
      The portfolio right now
    </h2>
  </div>

  <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
    {#each products as product}
      <ProductHealthCard {product} />
    {/each}
  </div>
</section>
