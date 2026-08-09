"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

export function useLocaleSwitch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  return useCallback(
    (locale: string) => {
      const query = searchParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      router.replace(href, { locale });
    },
    [pathname, router, searchParams],
  );
}
