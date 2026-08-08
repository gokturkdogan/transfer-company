# Project Rules

## Purpose

This is a production-grade multilingual VIP airport transfer booking platform. Code quality and maintainability take priority over speed of delivery.

## Scope boundaries

### In scope (current and planned)

- Location hierarchy (city → airport/district → hotel)
- Vehicle categories and capacity rules
- Route-based pricing (airport to district only)
- Extra services
- Reservation requests with customer, hotel/custom drop-off, and flight info
- Multilingual UI and translatable admin content
- Admin panel at `/admin/*` with custom session auth
- Reporting (future phase)

### Out of scope

- Online payment processing
- Real-time driver tracking
- Microservice architecture
- Mobile native apps

## Development workflow

1. Read relevant `/docs/*.md` and `.cursor/rules/*.mdc` before modifying a domain
2. For new **marketing/landing pages**, read [MARKETING_PAGE_DESIGN.md](./MARKETING_PAGE_DESIGN.md) first
3. Implement following the layering rules in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Update documentation after materially changing domain rules, architecture, or DB behavior
4. Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` before considering work complete

## Dependency policy

- Do not add libraries without a clear need
- Do not introduce abstractions before they are useful
- Prefer built-in Node/Next.js APIs when sufficient

## AI agent requirements

**Before modifying any domain:** read the relevant docs and Cursor rules.

**After introducing or materially changing:** domain rules, architecture decisions, database behavior, pricing rules, or reusable component contracts — update the relevant documentation. No undocumented domain behavior is allowed.

## Phase boundaries

- **Phase 1–4:** Architecture, DB, booking UI, pricing engine, reservation creation
- **Phase 5 (current):** Hierarchical locations, hotel drop-off, admin panel
- **Phase 6+:** Email notifications, reporting, enhanced admin workflows

Do not begin the next phase without explicit approval.
