import { Pool } from "pg";

const globalForDbHealth = globalThis as typeof globalThis & {
  healthPool?: Pool;
};

function inferDatabaseProvider(databaseUrl: string) {
  try {
    const hostname = new URL(databaseUrl).hostname.toLowerCase();

    if (hostname.includes("neon")) {
      return "neon";
    }

    if (hostname.includes("supabase")) {
      return "supabase";
    }

    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "local-postgres";
    }

    return "postgres";
  } catch {
    return "postgres";
  }
}

function getHealthPool(databaseUrl: string) {
  const existingPool = globalForDbHealth.healthPool;
  if (existingPool) {
    return existingPool;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDbHealth.healthPool = pool;
  }

  return pool;
}

export async function runDatabaseHealthCheck() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      ok: false,
      status: 500,
      result: {
        status: "error",
        error: "DATABASE_URL is not configured.",
        checkedAt: new Date().toISOString(),
      },
    } as const;
  }

  const startedAt = Date.now();
  const pool = getHealthPool(databaseUrl);

  try {
    const queryResult = await pool.query<{ now_utc: string }>(
      "select now() at time zone 'utc' as now_utc",
    );

    return {
      ok: true,
      status: 200,
      result: {
        status: "ok",
        provider: inferDatabaseProvider(databaseUrl),
        latencyMs: Date.now() - startedAt,
        databaseTimeUtc: queryResult.rows[0]?.now_utc ?? null,
        checkedAt: new Date().toISOString(),
      },
    } as const;
  } catch (error) {
    return {
      ok: false,
      status: 500,
      result: {
        status: "error",
        provider: inferDatabaseProvider(databaseUrl),
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "Database health check failed.",
        checkedAt: new Date().toISOString(),
      },
    } as const;
  }
}
