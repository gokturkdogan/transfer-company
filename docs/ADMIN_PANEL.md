# Admin Panel

## Overview

Phase 5 introduces a Turkish-only admin panel at `/admin/*`, **outside** the `[locale]` segment. It manages the hierarchical location model, airport-to-district pricing, and reservation review.

## Routes

| Path | Purpose |
|------|---------|
| `/admin` | Dashboard — revenue, trends, route/vehicle breakdowns |
| `/admin/login` | Email + password login |
| `/admin/locations` | Tabs: Airports, Cities, Districts, Hotels |
| `/admin/locations/[type]/new` | Create location |
| `/admin/locations/[type]/[id]/edit` | Edit location |
| `/admin/currencies` | Enabled currency selection |
| `/admin/extras` | Extra service list |
| `/admin/extras/new` | Create extra |
| `/admin/extras/[id]/edit` | Edit extra and per-currency prices |
| `/admin/vehicles` | Vehicle category list |
| `/admin/vehicles/new` | Create vehicle |
| `/admin/vehicles/[id]/edit` | Edit vehicle |
| `/admin/pricing` | Airport → district price editor (currency + vehicle tabs) |
| `/admin/reservations` | Reservation list |
| `/admin/reservations/[id]` | Reservation detail |
| `/admin/contact` | Contact channels (email, phone, WhatsApp) + SMTP test mail button |
| `/admin/contact/email-preview` | Browser preview for reservation email templates |
| `/admin/locales` | Enabled site languages for locale switcher |

`[type]` is one of `airports`, `cities`, `districts`, `hotels` (URL slug maps to `AIRPORT`, `CITY`, `DISTRICT`, `HOTEL`).

## Dashboard (`/admin`)

Operational overview for reservations and quoted revenue (no payment gateway — amounts reflect booking totals).

| Section | Metrics |
|---------|---------|
| KPI cards | Total reservations, upcoming vs completed, cancellation rate, passengers, trip type split |
| Currency cards | One card per supported currency (EUR, TRY, USD, GBP, RUB, AED): total / upcoming / completed / cancelled revenue and counts |
| Trend chart | Weekly (12 weeks) or monthly (12 months) reservation counts by transfer date (`outbound_at`) |
| Vehicle donut | Top primary transfer vehicle line items (`TRANSFER_VEHICLE`, excludes auto-added luggage overflow vehicles) |
| Routes bar | Top `snapshot_route_label` counts |
| Status donut | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| Weekday bar | Outbound date day-of-week density |
| Currency preference | Share of non-cancelled bookings per currency |
| Recent table | Last 8 reservations with link to detail |

Data layer: `DashboardAdminRepository` in `src/features/admin/server/dashboard-admin-repository.ts`. Charts: Recharts in `AdminDashboard` client component.

**PDF export:** Header action **PDF rapor indir** downloads a branded single-page summary from `GET /admin/dashboard-report` (admin session cookie path `/admin`). Ink/gold layout with logo emblem, KPI strip, revenue block, weekly transfer-date trend, breakdowns, and recent reservations. Builder: `build-dashboard-pdf.ts` (shared layout: `admin-pdf-layout.ts`). Filename: `dashboard-rapor-YYYY-MM-DD.pdf`.

### Reservation detail PDF

On `/admin/reservations/[id]`, **PDF indir** downloads a branded single-page summary from `GET /admin/reservations/[id]/report` (admin session required). Layout: ink/gold header with emblem logo, route strip, transfer/customer/passenger blocks, pricing column with gold total bar. Shared pdfmake setup: `src/features/admin/server/pdfmake-config.ts`, builder: `build-reservation-pdf.ts`. Filename: `rezervasyon-{reference}.pdf`.

**Classification rules:**
- **Upcoming:** `status IN (PENDING, CONFIRMED)` and `outbound_at > now()`
- **Completed:** not cancelled and (`status = COMPLETED` or `outbound_at <= now()`)
- **Cancelled:** `status = CANCELLED`

No FX conversion — each currency is reported separately.

## Authentication

Custom session auth — no third-party auth library.

| Component | Location |
|-----------|----------|
| Password hashing | `src/features/admin/server/password.ts` (scrypt) |
| Session creation / validation | `src/features/admin/server/auth.ts` |
| Cookie | HttpOnly signed cookie (`admin_session`) |
| Guard | `requireAdminSession()` in panel layout |
| Bootstrap | `pnpm admin:create` → `scripts/create-admin.ts` |

### Environment

- `ADMIN_SESSION_SECRET` — **required in production** (min 32 characters); validated at boot via `src/config/env.ts`
- `SKIP_ENV_VALIDATION` — must be `false` in production (never bypass Zod env checks on deploy)
- Dev/test fallback secret only applies when `SKIP_ENV_VALIDATION=true`

### Proxy

`src/proxy.ts` excludes `/admin` from next-intl and chains the admin session guard for protected routes.

## Location management

All mutations go through Server Actions under `src/features/admin/server/actions/` (barrel: `@/features/admin/server/actions`), delegating to admin repositories.

### Hierarchy rules (enforced server-side)

```
CITY (parentId = null)
  ├── AIRPORT
  └── DISTRICT
        └── HOTEL
```

- `assertValidParent()` runs on every create/update
- Hotels must have `parentId` pointing to a `DISTRICT` in the selected city
- District create/edit forms use a city selector; hotel forms use city → filtered district selectors
- `REGION` type is deprecated — never shown in admin selectors
- **Translations:** create/edit forms show `LocaleTextFields` for every active row in `enabled_locales`. Default locale (`tr`) name is required; values sync to `location_translations` and `default_name` on the parent row.

### Hotel list filters

- Search by name or code
- Filter by city (resolves districts under that city)
- Filter by district
- Active / inactive toggle

## Pricing editor

- Origin: active airports only (select at top; URL `?airport=` persists selection)
- Destination: active **districts** only — hotels never appear
- **Focused editor** (not a giant matrix): pick a **vehicle category** tab, then edit one-way / round-trip prices per district in a compact table
- Each price cell groups all **enabled currencies** in one bordered block; each row shows a flag emoji + input (EUR 🇪🇺, TRY 🇹🇷, etc.)
- District search filters the table without changing saved data
- Tab badges show fill progress (`filled/total` one-way prices across districts × currencies)
- Save persists all filled combinations for the selected airport across vehicles and currencies
- Configure visible currencies under `/admin/currencies` before entering route prices

## Extras editor

- List, create, and edit configurable extra services under `/admin/extras`
- Display names per active locale in `extra_service_translations` (default locale required)
- Per-currency prices in `extra_service_prices` — one row per extra + enabled currency
- Configure enabled currencies under `/admin/currencies` before entering extra prices
- Legacy `extra_services.price_minor` / `currency` columns mirror the first submitted price (booking engine integration pending)

## Vehicle management

- CRUD under `/admin/vehicles` for fleet vehicle categories used in pricing
- Fields: code, brand, model, localized display name, passenger/luggage capacity, dynamic feature labels (per locale), cover image, up to 4 gallery images
- Display name → `vehicle_category_translations`; feature labels → `vehicle_category_features` + `vehicle_category_feature_translations`
- Active vehicles appear as tabs in `/admin/pricing` editor
- Images upload to Cloudinary under `Home/Cars/{code-brand-model}/` with 16:9 crop in admin UI; returned `secure_url` is stored in `image_key` (cover + gallery)
- Requires server env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Contact information

- Manage site contact channels under `/admin/contact`
- Types: `EMAIL`, `PHONE`, `WHATSAPP` — multiple rows per type
- Each row has an active toggle; inactive rows are hidden on the public site (when wired)
- Values stored in `contact_channels` with per-type `sort_order`

## Locale options

- Manage visible languages under `/admin/locales`
- Catalog of supported locales: `src/config/locales.ts` (`SUPPORTED_LOCALES`) with flag emoji per language
- Active rows in `enabled_locales` drive header/footer locale switchers
- Admin UI: fixed grid of all supported languages with active toggle only (no add/remove or label editing from admin)
- Default locale (`tr`) cannot be deactivated while present in the list

## Reservation detail

Three distinct destination facets:

1. **Origin** — pickup airport (`pickupLocationId`)
2. **Pricing destination** — district used for route price (`dropoffLocationId`)
3. **Actual drop-off** — `snapshotDropoffLabel` (hotel name or custom destination)

**Status management** — admins can set any of `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` from the detail page. On change, a customer status notification email is sent (same branded template as booking confirmation). Status is persisted even if SMTP fails; the UI shows whether the email was sent.

**Passenger details** — named passengers from `passenger_details` are shown in their own section. `notes` is customer free-text only and does not include passenger names.

## Forbidden

- Pricing a route to a hotel
- Saving a hotel under a district in another city
- Bypassing `requireAdminSession()` on panel routes
- Storing plaintext passwords

## Related

- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — hierarchy and pricing invariant
- [SECURITY.md](./SECURITY.md) — admin auth details
- `.cursor/rules/admin.mdc` — agent rules
