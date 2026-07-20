import { eq } from "drizzle-orm";
import { db } from "./index";
import { categories } from "./schema";

/**
 * One-off: refreshes category descriptions already seeded on an existing
 * database, matching the copy in seed.ts. Safe to re-run.
 */
const UPDATES: Record<string, string> = {
  podis:
    "Dry spice powders ground fresh in small batches — the everyday flavour boost for rice, idli and dosa.",
  pickles:
    "Sun-ripened fruit and vegetable pickles, matured slowly in sesame oil the traditional way.",
  "farm-fresh": "Straight from our fields — nothing sits in a warehouse before it reaches you.",
  "home-snacks":
    "Crunchy and sweet snacks made by hand for festivals, evenings, and everything in between.",
};

async function run() {
  for (const [slug, description] of Object.entries(UPDATES)) {
    const [updated] = await db
      .update(categories)
      .set({ description })
      .where(eq(categories.slug, slug))
      .returning({ id: categories.id, name: categories.name });

    console.log(updated ? `Updated ${updated.name}` : `No category found for slug "${slug}"`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
