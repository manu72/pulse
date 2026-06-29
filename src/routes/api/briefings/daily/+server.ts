import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { generateDailyBriefing } from '$lib/server/ai/briefing';
import type { RequestHandler } from './$types';

// Protected endpoint that generates (and stores) the company daily briefing
// from the latest stored snapshots. Same shared-secret pattern as ingestion.
export const POST: RequestHandler = async ({ request }) => {
  const secret = env.PULSE_INGEST_SECRET;
  if (!secret || request.headers.get('x-pulse-ingest-secret') !== secret) {
    error(401, 'Unauthorized');
  }

  try {
    const briefing = await generateDailyBriefing();
    if (!briefing) {
      return json({
        status: 'skipped',
        reason:
          'No analytics snapshots found for today. Run GA4 ingestion first.'
      });
    }
    return json({ status: 'ok', briefing });
  } catch (err) {
    return json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Briefing generation failed'
      },
      { status: 500 }
    );
  }
};
