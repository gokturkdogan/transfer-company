# Admin Panel

## Overview

Phase 5 introduces an English-only admin panel at `/admin/*`, **outside** the `[locale]` segment. It manages the hierarchical location model, airport-to-district pricing, and reservation review.

## Routes

| Path | Purpose |
|------|---------|
| `/admin/login` | Email + password login |
| `/admin` | Dashboard |
| `/admin/locations` | Tabs: Airports, Cities, Districts, Hotels |
| `/admin/locations/[type]/new` | Create location |
| `/admin/locations/[type]/[id]/edit` | Edit location |
| `/admin/pricing` | Airport → district price matrix |
| `/admin/reservations` | Reservation list |
| `/admin/reservations/[id]` | Reservation detail |

`[type]` is one of `airports`, `cities`, `districts`, `hotels` (URL slug maps to `AIRPORT`, `CITY`, `DISTRICT`, `HOTEL`).

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

- `ADMIN_SESSION_SECRET` — required in production; dev fallback when `SKIP_ENV_VALIDATION=true`

### Proxy

`src/proxy.ts` excludes `/admin` from next-intl and chains the admin session guard for protected routes.

## Location management

All mutations go through Server Actions in `src/features/admin/server/actions.ts`, delegating to `LocationAdminRepository`.

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

### Hotel list filters

- Search by name or code
- Filter by city (resolves districts under that city)
- Filter by district
- Active / inactive toggle

## Pricing editor

- Origin: active airports only
- Destination: active **districts** only — hotels never appear
- Matrix: district × vehicle category with one-way and round-trip minor-unit prices

## Reservation detail

Three distinct destination facets:

1. **Origin** — pickup airport (`pickupLocationId`)
2. **Pricing destination** — district used for route price (`dropoffLocationId`)
3. **Actual drop-off** — `snapshotDropoffLabel` (hotel name or custom destination)

## Forbidden

- Pricing a route to a hotel
- Saving a hotel under a district in another city
- Bypassing `requireAdminSession()` on panel routes
- Storing plaintext passwords

## Related

- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — hierarchy and pricing invariant
- [SECURITY.md](./SECURITY.md) — admin auth details
- `.cursor/rules/admin.mdc` — agent rules
