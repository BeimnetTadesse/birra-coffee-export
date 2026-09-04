import "server-only";

import { Pool, type QueryResultRow } from "pg";

// Next.js hot-reloads modules in development, which would build a fresh Pool on
// every edit and quietly exhaust the database's connection limit. Caching the
// pool on globalThis keeps a single one alive across reloads.
declare global {
  // eslint-disable-next-line no-var
  var __birraPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }

  return new Pool({
    connectionString,
    // Deliberately small: on serverless each instance holds its own pool, so a
    // large max here multiplies into far more connections than the database
    // will accept. Raise it only on a long-lived server.
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!global.__birraPgPool) {
    global.__birraPgPool = createPool();
  }
  return global.__birraPgPool;
}

/**
 * Run a parameterised query.
 *
 * Always pass values through `params` — never interpolate them into the SQL
 * string. The placeholders are what make SQL injection impossible here.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}
