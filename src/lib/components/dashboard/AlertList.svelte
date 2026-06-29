<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { AlertItem } from '$lib/types/overview';

  const statusTone: Record<AlertItem['status'], 'warning' | 'critical'> = {
    watch: 'warning',
    attention: 'critical'
  };

  const statusLabel: Record<AlertItem['status'], string> = {
    watch: 'Watch',
    attention: 'Needs attention'
  };

  let { alerts }: { alerts: AlertItem[] } = $props();
</script>

<section
  aria-labelledby="alerts-heading"
  class="rounded-[2rem] border border-border bg-surface/80 p-5 md:p-6"
>
  <p class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle">
    Alerts
  </p>
  <h2
    id="alerts-heading"
    class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text"
  >
    Things needing attention
  </h2>

  <div class="mt-6 space-y-4">
    {#each alerts as alert}
      <article
        class="rounded-3xl border border-border bg-surface-elevated/70 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-text-subtle">{alert.product}</p>
            <h3 class="mt-1 font-medium text-text">{alert.title}</h3>
          </div>
          <Badge
            label={statusLabel[alert.status]}
            tone={statusTone[alert.status]}
          />
        </div>
        <p class="mt-3 text-sm leading-6 text-text-muted">{alert.summary}</p>
      </article>
    {/each}
  </div>
</section>
