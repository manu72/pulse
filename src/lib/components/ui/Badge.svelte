<script lang="ts">
  type BadgeTone = 'neutral' | 'positive' | 'warning' | 'critical';

  const toneClasses: Record<BadgeTone, string> = {
    neutral: 'border-border bg-surface-muted text-text-muted',
    positive: 'border-positive/30 bg-positive/10 text-positive',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    critical: 'border-critical/30 bg-critical/10 text-critical'
  };

  let { label, tone = 'neutral' }: { label: string; tone?: BadgeTone } =
    $props();
</script>

<span
  class={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
>
  {label}
</span>
