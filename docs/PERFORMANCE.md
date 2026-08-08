# Performance

## Rendering

- **Server Components by default** — minimize client JavaScript bundle
- `"use client"` only when interaction requires it
- Booking pages use `dynamic = "force-dynamic"` because locations load from DB at request time
- Scoped `BookingFlowProvider` — avoid global client state
- Avoid unnecessary Context providers outside feature boundaries
- Lazy-load heavy UI components where appropriate

## Data fetching

- Fetch data in Server Components, pass as props
- Do not fetch the same server data repeatedly in one request tree
- Use caching only where data consistency permits
- No client-side fetching when server rendering is better

## Database

- Select only required columns
- Avoid N+1 queries — use joins or Drizzle `with` relations
- Index foreign keys, locale columns, and frequently filtered columns
- Use connection pooling (Neon pooled connection string)
- Single Pool instance at module scope

## Images

- Use `next/image` for optimized image delivery
- Cloudinary or storage abstraction planned for later

## Build

- TypeScript strict mode catches errors at compile time
- Tree-shaking via ES modules and named exports

## Monitoring (future)

- Vercel Analytics for Web Vitals
- Structured JSON logging in production via `src/server/logger.ts`

## Anti-patterns

- Loading entire tables without pagination
- Unbounded `SELECT *` in repositories
- Creating new DB connections per request
- Client-side data fetching for static content
- Large client bundles from unnecessary `"use client"` boundaries
