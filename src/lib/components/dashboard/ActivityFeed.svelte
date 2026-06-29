<script lang="ts">
  import type { ActivityItem } from '$lib/types/overview';

  const toneClasses: Record<ActivityItem['tone'], string> = {
    neutral: 'bg-primary',
    positive: 'bg-positive',
    warning: 'bg-warning'
  };

  let { items }: { items: ActivityItem[] } = $props();
</script>

<section
  aria-labelledby="activity-heading"
  class="rounded-[2rem] border border-border bg-surface/80 p-5 md:p-6"
>
  <p class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle">
    Recent activity
  </p>
  <h2
    id="activity-heading"
    class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text"
  >
    What changed recently
  </h2>

  <div class="mt-6 space-y-5">
    {#each items as item}
      <article class="grid grid-cols-[auto_1fr] gap-4">
        <div
          class={`mt-2 h-2.5 w-2.5 rounded-full ${toneClasses[item.tone]}`}
        ></div>
        <div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 class="font-medium text-text">{item.product}</h3>
            <p class="text-sm text-text-subtle">{item.time}</p>
          </div>
          <p class="mt-1 text-sm leading-6 text-text-muted">{item.label}</p>
        </div>
      </article>
    {/each}
  </div>
</section>
