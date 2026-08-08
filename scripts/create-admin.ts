import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";

import * as schema from "../src/db/schema";
import { hashPassword } from "../src/features/admin/server/password";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

async function prompt(question: string): Promise<string> {
  const readline = createInterface({ input, output });
  const answer = await readline.question(question);
  readline.close();
  return answer.trim();
}

async function main() {
  const name = await prompt("Admin name: ");
  const email = (await prompt("Admin email: ")).toLowerCase();
  const password = await prompt("Admin password (min 8 chars): ");

  if (!name || !email || password.length < 8) {
    throw new Error("Name, email, and password (min 8 chars) are required");
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
