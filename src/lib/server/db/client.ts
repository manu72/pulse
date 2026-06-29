import { createClient, type Client } from '@libsql/client';
import { env } from '$env/dynamic/private';
import { DatabaseNotConfiguredError } from './errors';

// Server-only: this file lives under src/lib/server and imports $env/dynamic/private,
// which SvelteKit refuses to bundle for the browser. No DB config leaks client-side.

let client: Client | null = null;
let initialized = false;

function init() {
  initialized = true;
  const url = env.TURSO_DATABASE_URL;
  if (!url) return; // Not configured -> callers take the mock fallback path.
  client = createClient({
    url,
    authToken: env.TURSO_AUTH_TOKEN || undefined
  });
}

/** True when Turso env vars are present and database access can be attempted. */
export function isDbConfigured(): boolean {
  if (!initialized) init();
  return client !== null;
}

/** Returns the shared libsql client, or throws if Turso is not configured. */
export function getDb(): Client {
  if (!initialized) init();
  if (!client) throw new DatabaseNotConfiguredError();
  return client;
}
