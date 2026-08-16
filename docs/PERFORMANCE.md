# Performance

## Rendering

- **Server Components by default** — minimize client JavaScript bundle
- `"use client"` only when interaction requires it
- **Marketing pages** (home, fleet, fleet detail, about, privacy) use ISR with `export const revalidate = 120` and load catalog data via `unstable_cache` wrappers in `src/server/cache/public-catalog.ts`
- **Booking** stays `dynamic = "force-dynamic"` because it depends on `searchParams`, but still uses the same cached catalog loaders for airports, cities, districts, locales, and currencies
- Scoped `BookingFlowProvider` on the booking page — homepage hero uses slim `HomeSearchProvider`
- Avoid unnecessary Context providers outside feature boundaries
- Lazy-load heavy UI components where appropriate (`next/dynamic` for booking review/success/vehicles, hero datetime panel, non-hero search form)

## Public catalog cache

Cached loaders (revalidate **120s**) in `src/server/cache/public-catalog.ts`:

- `getCachedAirports(locale)`
- `getCachedCities(locale)`
- `getCachedDistricts(locale)` — single query for all active districts (`LocationService.getAllDistricts`)
- `getCachedPopularDestinations(locale)`
- `getCachedFleet(locale)`
- `getCachedFleetVehicleDetail(code, locale)` — fleet detail pages; request-scoped dedup via `getFleetVehicleDetailForPage`
- `getCachedEnabledLocales()`
- `getCachedEnabledPaymentCurrencies()`
- `getCachedActiveVehicleCodes()` — for sitemap / fleet URL expansion

Each wrapper uses tag `public-catalog` (revalidated from admin location/vehicle/pricing/extras/currency/locale mutations via `revalidatePublicCatalogCache()`).

Contact channels: `getCachedPublicContactChannels()` in `src/server/cache/contact-channels.ts` (tag `contact-channels`, 120s). Request-scoped dedup via `getPublicContactChannels()` in `public-contact.ts`.

Page facades wrap these for route composition:

- `getHomePageData(locale)` — `src/features/marketing/server/get-home-page-data.ts`
- `getBookingPageData(locale, query)` — `src/features/booking/server/get-booking-page-data.ts`

## Client bundle (hero / booking)

- Homepage hero uses lightweight `HomeSearchProvider` (search state only) — **not** full `BookingFlowProvider`
- Shared adapter: `useSearchFormState()` reads home or booking context
- `TransferSearchLauncher` hero variant imports only `HeroSearchBar`; `TransferSearchForm` is `next/dynamic` for non-hero variants
- `DateTimePickerPanel` is dynamically imported (`ssr: false`) from `DateTimeSegment`
- Booking flow dynamically imports `BookingReview`, `SuccessStep`, and `VehicleRecommendationList`
- Admin dashboard charts load via `next/dynamic` on `/admin` (Recharts split)
- Admin vehicle image crop dialog is dynamically imported on vehicle edit surfaces
- Quote requests use a sequence id; `QUOTE_SUCCESS` is ignored when `searchSignature` no longer matches current search
- `flag-icons` CSS is loaded once on mount from `FlagIcon` (not in locale layout)

## Message namespaces

Full `getMessages()` remains in the locale layout for now. Aggressive next-intl namespace filtering was deferred to avoid breaking nested translation keys across marketing + booking surfaces.

## Data fetching

- Fetch data in Server Components, pass as props
- Do not fetch the same server data repeatedly in one request tree
- Use caching only where data consistency permits (marketing catalog is safe at 120s; quotes/reservations stay uncached)
- No client-side fetching when server rendering is better

## Database

- Select only required columns
- Avoid N+1 queries — use joins or Drizzle `with` relations (e.g. bulk districts instead of per-city loops on public pages)
- Index foreign keys, locale columns, and frequently filtered columns
- Use connection pooling (Neon pooled connection string)
- Single Pool instance at module scope

## Images

- Use `next/image` for optimized image delivery
- Homepage hero uses compressed JPEG source (`hero-airport-transfer.jpg`); keep static marketing assets reasonably sized before deploy
- Cloudinary hosts admin-uploaded vehicle images (`Home/Cars/{code-brand-model}/`); public pages should prefer DB `imageKey` over static fallbacks when available

## Build

- TypeScript strict mode catches errors at compile time
- Tree-shaking via ES modules and named exports
- Optional bundle report: `pnpm analyze` (`ANALYZE=true next build`)

## Monitoring (future)

- Vercel Analytics for Web Vitals
- Structured JSON logging in production via `src/server/logger.ts`

## Anti-patterns

- Loading entire tables without pagination (except intentional bulk catalog reads behind cache)
- Unbounded `SELECT *` in repositories
- Creating new DB connections per request
- Client-side data fetching for static content
- Large client bundles from unnecessary `"use client"` boundaries
- N+1 district loads on marketing/booking pages when `getAllDistricts` / `getCachedDistricts` exists
