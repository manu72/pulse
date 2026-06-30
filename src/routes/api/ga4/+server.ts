import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db/client';
import {
  runGA4Ingestion,
  resolveGA4Credentials
} from '$lib/server/connectors/ga4-data';
import type { RequestHandler } from './$types';

function authorized(request: Request): boolean {
  const secret = env.PULSE_INGEST_SECRET;
  return (
    Boolean(secret) && request.headers.get('x-pulse-ingest-secret') === secret
  );
}

// Protected ingestion endpoint. Intended for Vercel Cron (or a local curl).
// Pulls GA4 for every configured product and stores metric snapshots.
export const POST: RequestHandler = async ({ request }) => {
  if (!authorized(request)) error(401, 'Unauthorized');

  const result = await runGA4Ingestion({
    db: getDb(),
    credentials: resolveGA4Credentials(env)
  });

  return json(result, { status: result.status === 'failed' ? 500 : 200 });
};
