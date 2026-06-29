import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getScriptDb } from './db';

const db = getScriptDb();
const migrationsDir = resolve(process.cwd(), 'migrations');

const ensureTrailingSemicolon = (sql: string) => {
  const trimmed = sql.trimEnd();
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
};

const sqlLiteral = (value: string) => `'${value.replaceAll("'", "''")}'`;

try {
  // Track applied migrations so the runner is safe to run repeatedly.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    (await db.execute('SELECT name FROM _migrations')).rows.map((row) =>
      String(row.name)
    )
  );

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log('Skip (already applied):', file);
      continue;
    }

    const sql = readFileSync(resolve(migrationsDir, file), 'utf8');
    const appliedAt = new Date().toISOString();

    await db.executeMultiple(`
      BEGIN;
      ${ensureTrailingSemicolon(sql)}
      INSERT INTO _migrations (name, applied_at)
      VALUES (${sqlLiteral(file)}, ${sqlLiteral(appliedAt)});
      COMMIT;
    `);

    console.log('Applied:', file);
  }

  console.log('Migrations complete.');
} finally {
  await db.close();
}
