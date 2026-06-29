<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import Surface from '$lib/components/ui/Surface.svelte';
  import type { DailyBriefing } from '$lib/types/overview';

  let { briefing }: { briefing: DailyBriefing } = $props();
</script>

<Surface class="relative overflow-hidden p-6 md:p-8">
  <div
    class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
  ></div>
  <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
    <div class="max-w-3xl">
      <Badge label="Daily AI briefing placeholder" tone="positive" />
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
      <p class="font-medium text-text">Generated later by AI</p>
      <p class="mt-1">{briefing.generatedAt}</p>
    </div>
  </div>
</Surface>
