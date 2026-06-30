import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  pool?: Pool;
};

export const databaseConfigured = Boolean(env.DATABASE_URL);

function getPool() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL in Vercel, or use a Vercel Postgres/Neon integration that provides POSTGRES_URL.",
    );
  }

  const pool =
    globalForDb.pool ??
    new Pool({
      connectionString: env.DATABASE_URL,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
  }

  return pool;
}

export const db = databaseConfigured ? drizzle(getPool(), { schema }) : null;
