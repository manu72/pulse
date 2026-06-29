import { createClient, type Client } from '@libsql/client';
import { loadEnv } from './env';

loadEnv();

/** Build the libsql client for a standalone script from process env. */
export function getScriptDb(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error(
      'TURSO_DATABASE_URL is not set. Add it to .env (use file:./local.db for local SQLite).'
    );
    process.exit(1);
  }
  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined
  });
}
