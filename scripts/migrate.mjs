import { config as loadEnv } from "dotenv";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

// Loads .env.local for local dev; silently does nothing if the file doesn't
// exist (e.g. on Vercel, where the platform injects env vars directly).
loadEnv({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

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

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

console.log(`Applying migrations to ${new URL(process.env.DATABASE_URL).hostname}...`);
try {
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  console.log("Migrations applied successfully.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
}
