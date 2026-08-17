/**
 * Forces all locale privacy pages from default-kvkk-{locale}.txt templates.
 * Run: pnpm db:reseed:privacy
 */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../src/db/schema";
import { seedPrivacyPageTranslations } from "./seed-privacy-page";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

process.env.PRIVACY_SEED_FORCE = "1";

seedPrivacyPageTranslations(db)
  .then(async () => {
    console.log("Privacy page reseed completed.");
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
