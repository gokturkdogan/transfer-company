import { cn } from "@/lib/utils";

export const SITE_NAV_SECTIONS = [
  { key: "about", href: "/about", type: "route" },
  { key: "guides", href: "/blog", type: "route" },
  { key: "fleet", href: "/fleet", type: "route" },
  { key: "createReservation", href: "/booking", type: "route" },
] as const;

export type SiteNavSection = (typeof SITE_NAV_SECTIONS)[number];

export function resolveSiteNavHref(
  pathname: string,
  section: SiteNavSection,
): string {
  if (section.type === "route") {
    return section.href;
  }

  return pathname === "/" ? section.href : `/${section.href}`;
}

export function isSiteNavItemActive(
  pathname: string,
  hash: string,
  section: SiteNavSection,
): boolean {
  if (section.type === "route") {
    return (
      pathname === section.href || pathname.startsWith(`${section.href}/`)
    );
  }

  return pathname === "/" && hash === section.href;
}

export function getSiteNavLinkClassName(isActive: boolean): string {
  return cn(
    "relative border-b-2 px-2 py-1.5 text-xs font-medium transition-colors lg:px-3.5 lg:pb-2.5 lg:pt-2 lg:text-sm",
    isActive
      ? "border-gold text-gold-light"
      : "border-transparent text-white/70 hover:border-gold/35 hover:text-white",
  );
}

export function getMobileSiteNavLinkClassName(isActive: boolean): string {
  return cn(
    "flex items-center justify-between rounded-xl border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors",
    isActive
      ? "border-gold bg-white/5 text-gold-light"
      : "border-transparent text-white/85 hover:bg-white/8 hover:text-white",
  );
}
