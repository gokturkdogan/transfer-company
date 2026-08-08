import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";

import * as schema from "../src/db/schema";
import { hashPassword } from "../src/features/admin/server/password";

const name = process.env.ADMIN_NAME ?? "Admin";
const email = (process.env.ADMIN_EMAIL ?? "admin@viptransfer.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "VipAdmin2026!";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

async function main() {
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = hashPassword(password);

  const [existing] = await db
    .select({ id: schema.adminUsers.id })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(schema.adminUsers)
      .set({
        name,
        passwordHash,
        isActive: true,
        deletedAt: null,
      })
      .where(eq(schema.adminUsers.id, existing.id));

    console.log(`Updated admin user: ${email}`);
    return;
  }

  await db.insert(schema.adminUsers).values({
    email,
    name,
    passwordHash,
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
