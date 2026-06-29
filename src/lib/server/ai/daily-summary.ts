import type { DailyBriefing } from '$lib/types/overview';

// Future AI entry point: summarize server-side aggregate metrics into an executive briefing.
export const createDailySummary = async (): Promise<DailyBriefing> => {
  return {
    greeting: 'Good morning.',
    headline: 'AI summaries are not connected yet.',
    summary: 'This placeholder keeps the future AI boundary server-only.',
    generatedAt: new Date().toISOString()
  };
};
