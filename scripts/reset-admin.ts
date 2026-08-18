import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";
import { hashPassword } from "../src/features/admin/server/password";

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Royal Rhein Admin";

if (!email || !password) {
  throw new Error(
    "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before running.",
  );
}

if (password.length < 8) {
  throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters.");
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

async function main() {
  const removed = await db
    .delete(schema.adminUsers)
    .returning({ id: schema.adminUsers.id });

  console.log(`Removed ${removed.length} existing admin user(s).`);

  await db.insert(schema.adminUsers).values({
    email,
    name,
    passwordHash: hashPassword(password),
    isActive: true,
  });

  console.log(`Created admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
