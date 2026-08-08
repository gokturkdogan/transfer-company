# Marketing Page Design Language

Premium VIP transfer marketing pages (homepage sections, About, future landing pages). **Read this doc before building or redesigning any public marketing page** — do not re-scan the whole codebase.

**Canonical reference:** `/[locale]/about` — `src/app/[locale]/about/page.tsx` + `src/components/about/*`

Related docs: [I18N_RULES.md](./I18N_RULES.md), [CODING_STANDARDS.md](./CODING_STANDARDS.md)

---

## Brand mood

| Attribute | Guideline |
|-----------|-----------|
| Tone | Premium, calm, confident — not flashy or “startup loud” |
| Palette | **Ink** (near-black) + **gold** accents + warm off-white surfaces |
| Density | **Lean content** — short paragraphs, 3–5 sections max per page |
| Imagery | Cinematic, photorealistic, black/gold/warm light; no logos or text in images |
| Motion | Subtle reveals and hovers; no aggressive animations |

---

## Design tokens

Defined in `src/app/globals.css` (`:root` + premium utilities).

| Token / class | Use |
|---------------|-----|
| `bg-ink`, `surface-ink` | Dark sections, hero overlays |
| `text-gold`, `text-gold-light`, `text-gold-deep` | Icons, eyebrows, accents |
| `bg-gold-gradient` | Primary CTAs, active pills |
| `text-gold-shimmer` | Headline accent line (animated) |
| `ring-gold-hairline` | Premium badge/pill border |
| `shadow-premium`, `shadow-float`, `shadow-gold` | Cards, popovers, buttons |
| `futuristic-grid` | Decorative grid on dark sections (always masked/faded) |
| `text-muted-foreground` | Body copy on light sections |
| `text-white/65`–`text-white/85` | Body copy on dark sections |

**Forbidden:** flat `#000` backgrounds, saturated blues/purples, heavy borders everywhere, long walls of text.

---

## Page shell

Every standalone marketing page should follow this layout (see `about/page.tsx`):

```tsx
<>
  <SiteHeader enabledLocales={enabledLocales} />
  <main className="flex flex-1 flex-col pb-20 md:pb-0">
    {/* sections */}
  </main>
  <SiteFooter enabledLocales={enabledLocales} />
  <MobileContactBar />
</>
```

- `pb-20` on `main` — clears fixed mobile contact bar
- Fetch `enabledLocales` via `resolveSiteLocales(new LocaleRepository(db))`
- Server Components by default; client only when needed (forms, drawers)

---

## Layout primitives

Reuse these — do not reinvent section spacing.

| Component | Path | Role |
|-----------|------|------|
| `Container` | `src/components/layout/Container.tsx` | Max-width horizontal padding |
| `Section` | `src/components/layout/Section.tsx` | Vertical rhythm `py-20 md:py-28` |
| `SectionHeading` | `src/components/layout/SectionHeading.tsx` | Eyebrow + title + subtitle (centered) |
| `Reveal` | `src/components/motion/Reveal.tsx` | Scroll-in animation |
| `FeatureCard` | `src/components/marketing/marketing-cards.tsx` | Icon + title + description card |

### `Section` variants

| Variant | When |
|---------|------|
| `default` | Light content (`bg-background`) |
| `muted` | Alternating band (`bg-muted`) — values, secondary blocks |
| `ink` | Dark premium band — promise, why-us; includes grid + gold hairline |

---

## Section recipes

### 1. Image hero (marketing inner pages)

**Example:** `AboutHero.tsx`

```
[full-bleed image]
  + gradient overlays (ink wash, radial gold spotlight)
  + Container with bottom-aligned content
  + badge pill (ring-gold-hairline + Sparkles icon)
  + h1 + gold shimmer accent line
  + short subtitle (1–2 lines)
  + optional stat/badge row (rounded-full pills)
  + bottom gold hairline (1px gradient)
```

**Sizing:** `min-h-[52vh] lg:min-h-[58vh]`, `pt-28`/`pb-14` (account for fixed header).

**Image:** `next/image` `fill` + `object-cover`; alt from i18n.

### 2. Split story (text + image)

**Example:** `AboutStory.tsx`

- `Section` (default) + `lg:grid-cols-2`
- Left: eyebrow (uppercase gold) → `h2` → 2 short paragraphs max
- Right: `rounded-[1.5rem] border border-border/70 shadow-premium`, `aspect-[4/3]`, image overlay gradient, corner **image badge** pill

### 3. Values / features grid

**Example:** `AboutValues.tsx`

- `Section variant="muted"` + `SectionHeading`
- `md:grid-cols-3` of `FeatureCard`
- Optional floating badge above card: `absolute -top-2.5 start-6` gold pill

### 4. Dark promise block

**Example:** `AboutPromise.tsx`

- `Section variant="ink"`
- Image + text side by side (image can be first on mobile)
- 3 inline badge pills under copy (`border-white/15 bg-white/8`)

### 5. Simple CTA band

**Example:** `AboutCta.tsx`

- Light band: `border-t border-border/60 bg-muted/40 py-16`
- Centered title + one line subtitle + gold gradient `Link` button (`rounded-full`, `shadow-gold`)

### 6. Homepage-only patterns

- **Form hero:** `HeroSection.tsx` + `HeroSearchBar` — booking-first on mobile
- **Trust marquee, stats, fleet, destinations:** existing `src/components/homepage/*`

---

## Typography

| Element | Classes |
|---------|---------|
| Page hero title | `text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white` |
| Hero accent | `text-gold-shimmer` (block below main title) |
| Section title | `text-3xl sm:text-4xl font-bold` via `SectionHeading` |
| Eyebrow | `text-[11px] font-bold uppercase tracking-[0.22em] text-gold` |
| Badge pill | `text-[10px]–text-xs font-semibold uppercase tracking-[0.14em]` |
| Body (light) | `text-base leading-relaxed text-muted-foreground` |
| Body (dark) | `text-base leading-relaxed text-white/65` |

**Rule:** Max 2 paragraphs per text block on marketing pages.

---

## Badges & pills

**Hero / section badge:**
```html
<p class="ring-gold-hairline inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light backdrop-blur-md">
  <Sparkles /> {label}
</p>
```

**Stat / trust pill (dark bg):**
```html
<span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
```

**Value card badge:** small gold uppercase pill overlapping card top edge.

---

## Imagery

### Config file per page group

```ts
// src/config/about-images.ts
export const ABOUT_IMAGES = {
  hero: "/images/about/about-hero.jpg",
  chauffeur: "/images/about/about-chauffeur.jpg",
} as const;
```

- Store files in `public/images/<page>/`
- Homepage images: `src/config/homepage-images.ts`
- Prefer **16:9** hero, **4:3** inline section images
- AI/generated assets: premium, understated, no text/logos; Antalya / VIP transfer context

### `next/image` defaults

```tsx
<Image src={...} alt={t("imageAlt")} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
```

Parent must be `relative` with explicit `aspect-*` or fixed height.

---

## Motion

- Entry: `animate-fade-up` on hero content; stagger via `Reveal` `delay={n * 80}`
- Cards: `hover:-translate-y-1.5` + `hover:shadow-premium` (already on `FeatureCard`)
- Dark sections: optional `animate-aurora` blurred gold orbs (`aria-hidden`, `pointer-events-none`)
- **Do not** add motion that increases layout shift or hurts mobile performance

---

## i18n

### Namespace

Top-level key per page, e.g. `about.*` in `messages/<locale>.json`:

```json
"about": {
  "meta": { "title": "...", "description": "..." },
  "hero": { "badge": "...", "title": "...", "titleAccent": "...", "subtitle": "..." },
  "story": { "eyebrow": "...", "title": "...", "paragraphs": { "0": "...", "1": "..." } }
}
```

- **All 5 locales** (`tr`, `en`, `de`, `ru`, `ar`) must have the same keys
- Turkish + English are authoritative; others may start from English quality
- Never hardcode user-facing strings in components
- Image `alt` text: translated (`imageAlt` keys)

### Navigation label

Add `home.nav.<pageKey>` for header/footer links (e.g. `home.nav.about`).

Use `@/i18n/navigation` `Link` — never raw `next/link` for locale routes.

---

## SEO & routing checklist

New marketing page at `src/app/[locale]/<slug>/page.tsx`:

- [ ] `generateMetadata` with `about.meta`-style title/description
- [ ] `alternates.languages` for all `LOCALES`
- [ ] OpenGraph image (hero asset)
- [ ] `setRequestLocale(locale)` in page component
- [ ] Add route to `src/app/sitemap.ts`
- [ ] Add nav entry in `SiteHeader`, `MobileNavDrawer`, `SiteFooter` if public-facing

---

## File structure template

```
src/
  app/[locale]/<slug>/page.tsx       # metadata + shell + section composition
  components/<slug>/
    <Slug>Hero.tsx
    <Slug>Story.tsx                  # optional blocks
    <Slug>Values.tsx
    <Slug>Cta.tsx
  config/<slug>-images.ts            # image paths
public/images/<slug>/*.jpg
messages/*.json                      # "<slug>": { ... }
```

Keep page `page.tsx` thin — compose sections only.

---

## Do / Don't

| Do | Don't |
|----|-------|
| Reuse `Section`, `SectionHeading`, `FeatureCard`, `Reveal` | Copy-paste one-off section CSS across pages |
| Alternate `default` / `muted` / `ink` section variants | Stack 6+ same-style sections |
| 3-column grids on desktop, 1-col on mobile | Dense multi-column text on mobile |
| Short copy + strong visuals | Long SEO paragraphs on marketing pages (use `SeoContent` pattern on homepage if needed) |
| Logical CSS (`ps-`, `pe-`, `ms-`, `me-`) for RTL | Physical `ml-`/`mr-` in new marketing components |
| `max-lg:` overrides for mobile-specific layout | Redesign desktop when only mobile needs change |

---

## Quick start: new page

1. Read this doc + [I18N_RULES.md](./I18N_RULES.md)
2. Copy structure from `src/app/[locale]/about/page.tsx`
3. Add `messages/*` keys for all locales
4. Add images under `public/images/<slug>/` + `src/config/<slug>-images.ts`
5. Build 3–5 sections using recipes above
6. Wire nav + sitemap
7. Run `pnpm typecheck && pnpm lint`
