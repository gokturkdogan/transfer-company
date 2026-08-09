import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.resolve(__dirname, "../messages");
const patchesDir = path.resolve(__dirname, "i18n");

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
      continue;
    }

    target[key] = value;
  }

  return target;
}

function flat(obj, prefix = "", acc = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flat(value, pathKey, acc);
    } else {
      acc[pathKey] = value;
    }
  }
  return acc;
}

const locales = ["de", "ru", "ar"];
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const enFlat = flat(en);

for (const locale of locales) {
  const localePath = path.join(messagesDir, `${locale}.json`);
  const patchPath = path.join(patchesDir, `${locale}-patch.json`);
  const patch2Path = path.join(patchesDir, `${locale}-patch-2.json`);
  const current = JSON.parse(fs.readFileSync(localePath, "utf8"));
  const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"));
  const patch2 = fs.existsSync(patch2Path)
    ? JSON.parse(fs.readFileSync(patch2Path, "utf8"))
    : {};

  const merged = deepMerge(deepMerge(current, patch), patch2);
  const mergedFlat = flat(merged);

  const stillEnglish = Object.keys(enFlat).filter(
    (key) => mergedFlat[key] === enFlat[key] && key !== "common.appName",
  );

  fs.writeFileSync(localePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`${locale}: applied patch, ${stillEnglish.length} keys still match en`);
}

console.log("Locale patches applied.");
