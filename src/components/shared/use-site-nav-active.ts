"use client";

import {
  isSiteNavItemActive,
  SITE_NAV_SECTIONS,
} from "@/components/shared/site-nav";
import { usePathname } from "@/i18n/navigation";

export function useActiveSiteNavKey(): string | null {
  const pathname = usePathname();

  const activeSection = SITE_NAV_SECTIONS.find((section) =>
    isSiteNavItemActive(pathname, "", section),
  );

  return activeSection?.key ?? null;
}
