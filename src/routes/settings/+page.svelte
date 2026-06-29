<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import Surface from '$lib/components/ui/Surface.svelte';
</script>

<svelte:head>
  <title>Settings | Pulse</title>
  <meta
    name="description"
    content="Placeholder settings for Pulse data sources and executive briefing preferences."
  />
</svelte:head>

<div class="space-y-6">
  <Surface class="p-6 md:p-8">
    <Badge label="Placeholder" tone="neutral" />
    <h1
      class="mt-5 text-4xl font-semibold tracking-[-0.06em] text-text md:text-6xl"
    >
      Settings
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-8 text-text-muted">
      This area will eventually manage product sources, connector credentials,
      alert thresholds and daily AI briefing preferences.
    </p>
  </Surface>

  <section class="grid gap-4 md:grid-cols-2" aria-label="Future settings areas">
    <article
      class="rounded-[2rem] border border-border bg-surface/80 p-5 md:p-6"
    >
      <p
        class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle"
      >
        Connectors
      </p>
      <h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
        Data source setup
      </h2>
      <p class="mt-3 text-sm leading-6 text-text-muted">
        GA4, Vercel, Cloud Run, Firebase and Supabase credentials should be
        configured here later.
      </p>
    </article>

    <article
      class="rounded-[2rem] border border-border bg-surface/80 p-5 md:p-6"
    >
      <p
        class="text-sm font-medium uppercase tracking-[0.22em] text-text-subtle"
      >
        Briefings
      </p>
      <h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
        Executive summary rules
      </h2>
      <p class="mt-3 text-sm leading-6 text-text-muted">
        AI summaries should stay concise, explain changes clearly and highlight
        only meaningful business signals.
      </p>
    </article>
  </section>
</div>
