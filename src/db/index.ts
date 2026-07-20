import { Pool } from "pg";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { IS_LOCAL } from "@/lib/env";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Defensive: a stray trailing newline/whitespace in the env var (easy to
// introduce when pasting into a dashboard) breaks the HTTP driver, which
// uses this value directly as a header.
const databaseUrl = process.env.DATABASE_URL.trim();

function createLocalDb() {
  // Local dev talks to the docker-compose Postgres over plain TCP — no
  // network-flakiness workarounds needed since it's all on localhost.
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzleNodePostgres(pool, { schema });
}

function createNeonDb() {
  const MAX_ATTEMPTS = 8;
  const BASE_DELAY_MS = 300;

  neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await fetch(input, init);
      } catch (error) {
        lastError = error;
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * attempt));
        }
      }
    }

    throw lastError;
  };

  const sql = neon(databaseUrl);
  return drizzleNeonHttp(sql, { schema });
}

// Both adapters implement the same drizzle query-builder surface we use
// (select/insert/update/delete chains); cast to one shape so call sites
// don't have to deal with a driver-specific result-kind union type.
export const db = (IS_LOCAL ? createLocalDb() : createNeonDb()) as ReturnType<
  typeof createNeonDb
>;
