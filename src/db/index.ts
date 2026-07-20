import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

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

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
