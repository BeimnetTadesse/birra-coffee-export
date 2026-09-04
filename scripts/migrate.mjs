#!/usr/bin/env node
/**
 * Applies every .sql file in db/migrations that hasn't run yet, in filename
 * order, each inside a transaction. Applied filenames are recorded in
 * schema_migrations so re-running is a no-op.
 *
 *   npm run db:migrate
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import pg from "pg";

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "db",
  "migrations",
);

// Load DATABASE_URL from .env.local / .env without adding a dotenv dependency.
async function loadEnvFile() {
  if (process.env.DATABASE_URL) return;

  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = await readFile(path.join(root, file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
    if (process.env.DATABASE_URL) return;
  }
}

async function main() {
  await loadEnvFile();

  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set.\nCopy .env.example to .env.local and fill in your connection string.",
    );
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename    TEXT        PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const { rows } = await client.query("SELECT filename FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.filename));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`  skip  ${filename}`);
        continue;
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, filename), "utf8");

      // Each migration is all-or-nothing: a failure halfway through leaves the
      // schema untouched rather than half-applied.
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename],
        );
        await client.query("COMMIT");
        console.log(`  applied ${filename}`);
        ran += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`\nFailed on ${filename} — rolled back, no changes made.`);
        throw error;
      }
    }

    console.log(ran === 0 ? "\nAlready up to date." : `\nDone — ${ran} migration(s) applied.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
