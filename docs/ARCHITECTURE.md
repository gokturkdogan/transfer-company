# Architecture

## Overview

Royal Rhein Transfers is a **modular monolith** built on Next.js 16 App Router. The system handles multilingual VIP airport transfer **reservation requests** (not online payments).

Public brand name: **Royal Rhein Transfers** (`common.appName`, `APP_NAME`).

## Layering

```
UI (Server Component by default)
  ↓
Route Handler / Server Action
  ↓
Zod validation (+ rate limiting in handlers)
  ↓
Domain Service (features/*/server/service.ts)
  ↓
Repository (features/*/server/repository.ts)
  ↓
Drizzle ORM → Neon PostgreSQL
```

## Public API layer

Phase 3 exposes booking via Route Handlers:

- `POST /api/quote` — vehicle availability and pricing (optional `selection` for requote)
- `POST /api/reservations` — reservation creation
- `GET /api/locations/hotels` — hotels for a district (`createRouteHandler` + `inputSource: "searchParams"`)

Phase 4 adds the public booking UI at `/[locale]/booking` with a scoped reducer + context. Phase 5 adds `/admin/*` (outside i18n) and hierarchical locations. See [BOOKING_UI.md](./BOOKING_UI.md) and [ADMIN_PANEL.md](./ADMIN_PANEL.md).

Handlers use `createRouteHandler()` from `src/server/http/route-handler.ts`. **No business logic in handlers.** Public marketing/booking pages compose data via facades (`getHomePageData`, `getBookingPageData`) over `src/server/cache/public-catalog.ts`.

## Timezone policy

- Business timezone: `Europe/Istanbul` (`PROJECT_TIME_ZONE`)
- Client sends wall-clock datetimes; server converts via `src/lib/datetime.ts`
- Database stores UTC `timestamptz`
- API responses render back in business timezone

## Directory structure

| Path | Responsibility |
|------|----------------|
| `src/app/admin/` | Admin panel routes (English, no locale prefix) |
| `src/features/admin/` | Admin auth, location/pricing/reservation management; UI enums via `lib/public-enums.ts`; Server Actions split under `server/actions/` |
| `src/app/` | Routes, layouts, pages (public `[locale]` + admin) |
| `src/features/<domain>/` | Domain modules (components, schemas, server, types, utils) |
| `src/server/` | Cross-cutting server infrastructure (errors, logger, action wrapper, public catalog cache) |
| `src/db/` | Database client and Drizzle schema |
| `src/config/` | Typed environment (`serverEnv` / `clientEnv`, including optional SMTP) and constants |
| `src/lib/` | Pure shared utilities (money, reference codes) |
| `src/components/ui/` | shadcn/ui primitives |
| `src/components/shared/` | Cross-feature presentation components (incl. public `GlobalLoaderProvider` / overlay) |
| `src/i18n/` | next-intl routing and navigation |
| `messages/` | UI translation JSON files |

## Key rules

- **Server Components by default.** Add `"use client"` only when interaction requires it.
- **No database access in UI components.** Components call Server Actions or receive data as props.
- **Business logic lives in services**, not in components, route handlers, or repositories.
- **Repositories own persistence only.** No domain rules in query files.
- **No premature abstractions.** Add shared code only when a second real use case exists.
- **No microservices.** This is a single deployable application.

## Runtime

- Deployed on Vercel
- Node.js runtime for database operations
- Neon PostgreSQL with pooled WebSocket connections (`drizzle-orm/neon-serverless`)

## Internationalization

- Locales: `tr` (default), `en`, `de`, `ru`, `ar`
- URL prefix always present: `/tr/...`, `/en/...`, etc.
- Arabic (`ar`) uses RTL layout direction
- UI strings: `messages/<locale>.json`
- Admin-editable content: sibling translation tables in the database

## Related docs

- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)
- [DATABASE_RULES.md](./DATABASE_RULES.md)
- [API_CONTRACTS.md](./API_CONTRACTS.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [DECISIONS.md](./DECISIONS.md)
