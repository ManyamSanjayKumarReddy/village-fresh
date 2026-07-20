import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

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

console.log("Applying migrations over HTTPS (port 443)...");
try {
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  console.log("Migrations applied successfully.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
}
