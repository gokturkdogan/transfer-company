"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  isSiteNavItemActive,
  SITE_NAV_SECTIONS,
} from "@/components/shared/site-nav";
import { usePathname } from "@/i18n/navigation";

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

export function useActiveSiteNavKey(): string | null {
  const pathname = usePathname();
  const urlHash = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerHashSnapshot,
  );
  const [scrollHash, setScrollHash] = useState("");
  const hash = urlHash || scrollHash;

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
            setScrollHash(item.href);
            return;
          }

          if (urlHash === item.href) {
            return;
          }

          setScrollHash((current) => (current === item.href ? "" : current));
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0.12 },
      );

      observer.observe(element);
      return [observer];
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [pathname, urlHash]);

  const activeSection = SITE_NAV_SECTIONS.find((section) =>
    isSiteNavItemActive(pathname, hash, section),
  );

  return activeSection?.key ?? null;
}
