<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    as = 'section',
    class: className = '',
    children
  }: {
    as?: 'section' | 'article' | 'div';
    class?: string;
    children: Snippet;
  } = $props();
</script>

<svelte:element
  this={as}
  class={`rounded-[2rem] border border-border bg-surface/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur md:p-6 ${className}`}
>
  {@render children()}
</svelte:element>
