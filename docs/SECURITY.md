# Security

## Server-side validation

- All input validated with Zod on the server
- Client-side validation is UX only — never authoritative
- Route Handlers use `createRouteHandler()` wrapper with schema validation

## Price integrity

- **Never trust client-supplied prices.** Always calculate server-side from database.
- `clientQuotedTotalMinor` is accepted for logging only; mismatches are logged and ignored.
- **Never trust client-supplied entity relationships.** Verify IDs exist and are active.
- Verify hotel `parentId` matches submitted `destinationDistrictId` on reservation create
- Non-customer-selectable extras (`customerSelectable = false`) cannot be manually requested.

## Environment variables

- Validated in `src/config/env.ts` via Zod
- Server vars: `import { serverEnv } from "@/config/env"` (server-only)
- Client vars: `NEXT_PUBLIC_*` prefix only
- Never access `process.env` directly elsewhere
- Never expose secrets in client bundles

## Error handling

- Use `AppError` hierarchy (`src/server/errors.ts`)
- `toPublicError()` strips internal details before sending to client
- Never leak stack traces, SQL errors, or internal paths to users
- Log internal details via `logger.error()` — never log full customer payloads

## Rate limiting

Postgres-backed fixed-window counters via `rate_limit_buckets`:

| Endpoint | Limit |
|----------|-------|
| `POST /api/quote` | 30 / minute / IP |
| `POST /api/reservations` | 10 / hour / IP + 5 / hour / email |

Rate limiting is applied in Route Handlers only — domain services are unaware.

## Idempotency

- `Idempotency-Key` header required for reservation creation
- Unique constraint on `reservation_idempotency_keys.key`
- Same key + same payload → replay existing reservation
- Same key + different payload → HTTP 409

## Anti-spam

- Honeypot field (`website` must be empty)
- Minimum form fill time (3 seconds)
- Turnstile extension point (not implemented in Phase 3)

## PII exposure

- Reservation API response returns reference, dates, totals, line items only
- No customer email, phone, or internal UUIDs in public responses
- Customer PII stored in `customers` table

## Authorization

### Admin panel (Phase 5)

- Custom scrypt session auth — `admin_users` + `admin_sessions`
- HttpOnly signed cookie; `ADMIN_SESSION_SECRET` in `serverEnv`
- `requireAdminSession()` guard on `/admin/*` routes (except login)
- Bootstrap: `pnpm admin:create`
- See [ADMIN_PANEL.md](./ADMIN_PANEL.md)

### Public API

- No customer authentication
- Reservation endpoints are unauthenticated (rate-limited)

## Data protection

- Customer PII (name, email, phone) stored in `customers` table
- No payment card data (payments not in scope)
- Soft delete preserves data integrity for historical reservations

## HTTP security (deployment)

- HTTPS enforced by Vercel
- Security headers to be configured in `next.config.ts` when needed
- Public APIs are same-origin Route Handlers (no CORS needed for Phase 4 UI)

## Input sanitization

- Zod schemas enforce types, lengths, and formats
- Wall-clock datetimes validated as `YYYY-MM-DDTHH:mm` and converted server-side
- Admin input will require additional sanitization when admin panel is built
- No raw HTML rendering of user input
