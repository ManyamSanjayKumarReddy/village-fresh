import { db } from "./index";
import { serviceablePincodes } from "./schema";

/**
 * Standard Chennai city pincode range (600001–600123). Safe to re-run —
 * skips any pincode already present instead of erroring.
 */
async function seedPincodes() {
  const pincodes = Array.from({ length: 123 }, (_, i) => {
    const code = String(600001 + i).padStart(6, "0");
    return { pincode: code, city: "Chennai" };
  });

  await db.insert(serviceablePincodes).values(pincodes).onConflictDoNothing();

  console.log(`Seeded ${pincodes.length} Chennai pincodes (600001–600123).`);
}

seedPincodes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
