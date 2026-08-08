#!/usr/bin/env tsx
/**
 * Fresh database bootstrap for Neon (or any Postgres).
 *
 * Applies all Drizzle migrations in ./drizzle, then runs scripts/seed.ts.
 *
 * Usage:
 *   pnpm db:setup
 *   # or with a custom URL:
 *   DATABASE_URL="postgresql://..." pnpm db:setup
 */

import { execSync } from "node:child_process";

function run(command: string, label: string) {
  console.log(`\n▶ ${label}...`);
  execSync(command, { stdio: "inherit", env: process.env });
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required (.env.local or environment).");
    process.exit(1);
  }

  console.log("Bootstrapping database...");
  run("pnpm db:migrate", "Applying migrations");
  run("pnpm db:seed", "Seeding reference data");
  console.log("\n✓ Database setup complete.");
}

main();
