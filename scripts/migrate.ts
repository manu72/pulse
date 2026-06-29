import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getScriptDb } from './db';

const db = getScriptDb();
const migrationsDir = resolve(process.cwd(), 'migrations');

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
  // executeMultiple runs every statement in the file inside one transaction.
  await db.executeMultiple(sql);
  await db.execute({
    sql: 'INSERT INTO _migrations (name, applied_at) VALUES (?, ?)',
    args: [file, new Date().toISOString()]
  });
  console.log('Applied:', file);
}

console.log('Migrations complete.');
await db.close();
