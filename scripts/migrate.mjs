import { config as loadEnv } from "dotenv";

// Loads .env.local for local dev; silently does nothing if the file doesn't
// exist (e.g. on Vercel, where the platform injects env vars directly).
loadEnv({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Defensive: strip stray whitespace/newlines that break header construction
// in the HTTP driver (see e.g. pasting a connection string into a dashboard).
const databaseUrl = process.env.DATABASE_URL.trim();
const isLocal = (process.env.ENV ?? "").toLowerCase() === "local";

async function migrateLocal() {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");

  const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 15000 });
  const db = drizzle(pool);

  console.log(`Applying migrations to local Postgres (${new URL(databaseUrl).host})...`);
  try {
    await migrate(db, { migrationsFolder: "src/db/migrations" });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

async function migrateNeon() {
  const { neon, neonConfig } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { migrate } = await import("drizzle-orm/neon-http/migrator");

  const MAX_ATTEMPTS = 6;
  const BASE_DELAY_MS = 500;

  neonConfig.fetchFunction = async (input, init) => {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await fetch(input, init);
      } catch (error) {
        lastError = error;
        console.log(`  fetch attempt ${attempt}/${MAX_ATTEMPTS} failed, retrying...`);
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * attempt));
        }
      }
    }

    throw lastError;
  };

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log(`Applying migrations to ${new URL(databaseUrl).hostname}...`);
  try {
    await migrate(db, { migrationsFolder: "src/db/migrations" });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  }
}

if (isLocal) {
  await migrateLocal();
} else {
  await migrateNeon();
}
