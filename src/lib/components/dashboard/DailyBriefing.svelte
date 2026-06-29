<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import Surface from '$lib/components/ui/Surface.svelte';
  import type { DailyBriefing } from '$lib/types/overview';

  let {
    briefing,
    status = 'mock'
  }: {
    briefing: DailyBriefing;
    status?: 'live' | 'empty' | 'mock';
  } = $props();

  const badgeLabel = $derived(
    status === 'mock' ? 'Daily AI briefing placeholder' : 'Daily AI briefing'
  );

  const generatedLabel = $derived(
    status === 'live'
      ? `Generated ${briefing.generatedAt}`
      : status === 'empty'
        ? 'Awaiting first snapshot'
        : 'Generated later by AI'
  );
</script>

<Surface class="relative overflow-hidden p-6 md:p-8">
  <div
    class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
  ></div>
  <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
    <div class="max-w-3xl">
      <Badge
        label={badgeLabel}
        tone={status === 'empty' ? 'neutral' : 'positive'}
      />
      <p class="mt-8 text-lg text-text-muted">{briefing.greeting}</p>
      <h1
        class="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-text md:text-6xl"
      >
        {briefing.headline}
      </h1>
      <p class="mt-5 max-w-2xl text-base leading-7 text-text-muted md:text-lg">
        {briefing.summary}
      </p>
    </div>

    <div
      class="rounded-2xl border border-border bg-surface-elevated/70 p-4 text-sm text-text-muted"
    >
      <p class="font-medium text-text">Daily AI briefing</p>
      <p class="mt-1">{generatedLabel}</p>
    </div>
  </div>
</Surface>
