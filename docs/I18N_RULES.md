# Internationalization Rules

## Locales

| Code | Language | Direction |
|------|----------|-----------|
| `tr` | Turkish | LTR (default) |
| `en` | English | LTR |
| `de` | German | LTR |
| `ru` | Russian | LTR |
| `ar` | Arabic | RTL |

Default locale: `tr`

## URL routing

- Always prefixed: `/tr/...`, `/en/...`, etc.
- Middleware: `src/proxy.ts` (Next.js 16 convention)
- Config: `src/i18n/routing.ts`

## UI translations

- Files: `messages/<locale>.json`
- Server Components: `getTranslations()` from `next-intl/server`
- Client Components: `useTranslations()` from `next-intl`
- Never hardcode user-facing strings in components

## RTL support

- `dir` attribute set on `<html>` based on locale
- Arabic (`ar`) renders right-to-left
- Use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) over physical (`ml-`, `mr-`)
- Booking UI strings live under `booking.*`, `vehicle.*`, `extras.*`, `contact.*`, `errors.*` in `messages/<locale>.json`
- Automated test scans booking components for forbidden physical-direction Tailwind classes

## Booking flow copy

All five locales (`tr`, `en`, `de`, `ru`, `ar`) must include the same booking message keys. Turkish and English are authoritative; other locales may fall back to English until professionally translated.

## Database content translations

Admin-editable content uses sibling translation tables:

- `region_translations`
- `location_translations`
- `vehicle_category_translations`
- `extra_service_translations`

Pattern: `(entity_id, locale)` unique constraint.

Query pattern: join parent table with translation for the requested locale, fall back to default locale (`tr`) if translation missing.

## Navigation

Use locale-aware helpers from `src/i18n/navigation.ts`:

```typescript
import { Link, redirect, usePathname, useRouter } from "@/i18n/navigation";
```

Never use `next/link` or `next/navigation` directly for locale-aware routes.

## Adding a new locale

1. Add locale code to `LOCALES` in `src/config/constants.ts`
2. Add to `routing.locales` in `src/i18n/routing.ts`
3. Create `messages/<locale>.json`
4. Update RTL_LOCALES if needed
5. Update this document
