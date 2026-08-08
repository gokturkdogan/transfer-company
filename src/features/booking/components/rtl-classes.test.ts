import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const BOOKING_COMPONENTS_DIR = path.resolve(
  process.cwd(),
  "src/features/booking/components",
);

const FORBIDDEN_PATTERNS = [
  /\bml-/,
  /\bmr-/,
  /\bpl-/,
  /\bpr-/,
  /\btext-left\b/,
  /\btext-right\b/,
  /\bleft-/,
  /\bright-/,
];

function collectTsxFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectTsxFiles(fullPath));
      continue;
    }

    if (entry.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("booking component RTL classes", () => {
  it("does not use physical direction utility classes", () => {
    const files = collectTsxFiles(BOOKING_COMPONENTS_DIR);
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");

      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file}: ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
