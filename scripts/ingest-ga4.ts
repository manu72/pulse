import { loadEnv } from './env';
import { getScriptDb } from './db';
import {
  runGA4Ingestion,
  resolveGA4Credentials
} from '../src/lib/server/connectors/ga4-data';

loadEnv();

const hasCreds =
  Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
  (Boolean(process.env.GOOGLE_CLIENT_EMAIL) &&
    Boolean(process.env.GOOGLE_PRIVATE_KEY));

if (!hasCreds) {
  console.warn(
    'Warning: no GA4 credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY in .env.'
  );
}

const result = await runGA4Ingestion({
  db: getScriptDb(),
  credentials: resolveGA4Credentials(
    process.env as Record<string, string | undefined>
  )
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.status === 'failed' ? 1 : 0);
