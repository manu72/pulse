<script lang="ts">
  import ProductSummary from '$lib/components/product/ProductSummary.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.product.name} | Pulse</title>
  <meta
    name="description"
    content={`Mock health detail page for ${data.product.name}.`}
  />
</svelte:head>

<ProductSummary product={data.product} />
