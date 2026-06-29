<script lang="ts">
  import { appConfig } from '$lib/config/app';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen">
  <header
    class="sticky top-0 z-20 border-b border-border bg-background/75 backdrop-blur-xl"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      aria-label="Primary navigation"
    >
      <a
        href="/"
        class="inline-flex items-center gap-3 rounded-full focus-visible:outline-primary-strong"
      >
        <span
          class="grid h-9 w-9 place-items-center rounded-2xl bg-text text-sm font-bold text-background"
        >
          P
        </span>
        <span>
          <span class="block text-sm font-semibold leading-none text-text"
            >{appConfig.name}</span
          >
          <span class="mt-1 block text-xs text-text-subtle"
            >{appConfig.owner}</span
          >
        </span>
      </a>

      <div
        class="flex items-center gap-2 rounded-full border border-border bg-surface/80 p-1"
      >
        {#each appConfig.navigation as item}
          <a
            href={item.href}
            class="rounded-full px-3 py-2 text-sm text-text-muted transition hover:bg-surface-muted hover:text-text"
          >
            {item.label}
          </a>
        {/each}
      </div>
    </nav>
  </header>

  <main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
    {@render children()}
  </main>
</div>
