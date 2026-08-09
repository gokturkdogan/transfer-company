"use client";

import { useCallback } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

export function useLocaleSwitch() {
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(
    (locale: string) => {
      const query =
        typeof window !== "undefined"
          ? window.location.search.replace(/^\?/, "")
          : "";
      const href = query ? `${pathname}?${query}` : pathname;
      router.replace(href, { locale });
    },
    [pathname, router],
  );
}
