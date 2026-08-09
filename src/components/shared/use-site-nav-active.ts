"use client";

import { useEffect, useState } from "react";

import {
  isSiteNavItemActive,
  SITE_NAV_SECTIONS,
} from "@/components/shared/site-nav";
import { usePathname } from "@/i18n/navigation";

function readLocationHash(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.hash;
}

export function useActiveSiteNavKey(): string | null {
  const pathname = usePathname();
  const [hash, setHash] = useState(readLocationHash);

  useEffect(() => {
    const syncHash = () => setHash(readLocationHash());

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const hashSections = SITE_NAV_SECTIONS.filter(
      (item) => item.type === "hash",
    );

    const observers = hashSections.flatMap((item) => {
      const element = document.querySelector(item.href);

      if (!element) {
        return [];
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) {
            return;
          }

          if (entry.isIntersecting) {
            setHash(item.href);
            return;
          }

          if (readLocationHash() === item.href) {
            return;
          }

          setHash((current) => (current === item.href ? "" : current));
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0.12 },
      );

      observer.observe(element);
      return [observer];
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [pathname]);

  const activeSection = SITE_NAV_SECTIONS.find((section) =>
    isSiteNavItemActive(pathname, hash, section),
  );

  return activeSection?.key ?? null;
}
