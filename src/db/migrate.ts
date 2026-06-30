import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("Migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
