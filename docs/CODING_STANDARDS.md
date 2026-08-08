# Coding Standards

## TypeScript

- **Strict mode** enabled
- No `any` — use `unknown` and narrow
- Explicit return types on exported functions
- Prefer `as const` tuples for enum-like values

## Components

- Server Components by default
- `"use client"` only for: forms, interactive widgets, browser APIs, hooks
- No business logic in JSX
- No database imports in components
- Keep components small and composable; extract when > ~150 lines

## Server code

- Use `import "server-only"` in server modules that must not reach the client
- Server Actions return `ActionResult<T>` via `createAction()` wrapper
- Never throw raw errors across the action boundary
- Validate all input with Zod on the server, even if validated on the client

## Naming

| Kind | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `booking-draft.ts` |
| Components | PascalCase | `BookingForm.tsx` |
| Functions | camelCase | `calculatePrice` |
| Types/Interfaces | PascalCase | `PriceQuote` |
| Constants | SCREAMING_SNAKE | `DEFAULT_CURRENCY` |
| DB tables | snake_case | `route_prices` |
| DB columns | snake_case | `price_minor` |

## Forbidden patterns

- `any` type
- `console.log` in production code (use `logger`)
- Silent `catch` blocks
- Magic strings for statuses (use enums/constants)
- Magic numbers for money (use `src/lib/money.ts`)
- Database calls inside UI components
- Business rules inside route handlers or repositories
- Unnecessary `useEffect`
- Client-side fetching when server rendering suffices
- Circular dependencies
- Barrel files that create import ambiguity
- Premature abstraction / speculative code

## Preferred patterns

- Pure functions for transformations
- Small, focused modules
- Domain-oriented APIs
- Centralized constants in `src/config/constants.ts`
- Immutable data transformations
- Descriptive variable and function names

## Imports

- Use `@/` path alias
- Group: external → internal → relative
- No default exports for utilities (named exports preferred)
