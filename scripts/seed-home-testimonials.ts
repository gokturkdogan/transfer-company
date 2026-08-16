import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Pool } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import { HOME_TESTIMONIAL_SLOT_INDICES } from "../src/config/home-testimonials";
import { SUPPORTED_LOCALES } from "../src/config/locales";
import * as schema from "../src/db/schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require",
});
const db = drizzle(pool, { schema });

type MessageTestimonialItem = {
  quote: string;
  author: string;
};

type MessageFile = {
  home?: {
    testimonials?: {
      items?: MessageTestimonialItem[];
    };
  };
};

function parseAuthor(author: string): { firstName: string; lastName: string } {
  const namePart = author.split(",")[0]?.trim() ?? "";
  const parts = namePart.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function loadLocaleTestimonials(locale: string): MessageTestimonialItem[] {
  const filePath = join(process.cwd(), "messages", `${locale}.json`);
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as MessageFile;

  return parsed.home?.testimonials?.items ?? [];
}

async function main() {
  const [rowCount] = await db
    .select({ value: count() })
    .from(schema.homeTestimonials);

  if (rowCount.value > 0) {
    console.log(
      `Skipping seed: ${rowCount.value} home testimonial row(s) already exist.`,
    );
    return;
  }

  const rows = SUPPORTED_LOCALES.flatMap((locale) => {
    const items = loadLocaleTestimonials(locale.code);

    return HOME_TESTIMONIAL_SLOT_INDICES.map((slotIndex) => {
      const item = items[slotIndex];
      const { firstName, lastName } = parseAuthor(item?.author ?? "");
      const quote = item?.quote?.trim() ?? "";
      const isActive = Boolean(quote && firstName);

      return {
        locale: locale.code,
        slotIndex,
        firstName,
        lastName,
        quote,
        rating: 5,
        sortOrder: slotIndex,
        isActive,
      };
    });
  });

  await db.insert(schema.homeTestimonials).values(rows);

  const active = rows.filter((row) => row.isActive).length;
  console.log(`Seeded ${active} active home testimonials across locales.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
