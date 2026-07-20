import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run db:make-admin -- sanjaykumarreddymanyam@gmail.com");
  process.exit(1);
}

async function makeAdmin() {
  const [user] = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  console.log(`${user.email} is now an admin (user id ${user.id}).`);
}

makeAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
