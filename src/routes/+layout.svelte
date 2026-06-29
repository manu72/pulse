<script lang="ts">
  import AppShell from '$lib/components/product/AppShell.svelte';
  import '$lib/styles/app.css';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<AppShell>
  {@render children()}
</AppShell>
